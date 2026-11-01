import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock3,
  UserRound,
  Hash,
  Building2,
  GraduationCap,
  RefreshCw,
  ScanLine,
  Users,
} from "lucide-react";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

import { api } from "./api";
import "./admin.css";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function AttendanceScanner() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanError, setScanError] = useState("");
  const [result, setResult] = useState(null);

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn("Scanner stop:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.warn("Scanner cleanup:", error);
    }

    if (scannerRef.current === scanner) {
      scannerRef.current = null;
    }

    if (mountedRef.current) {
      setCameraActive(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        const cleanup = async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch (error) {
            console.warn("Scanner cleanup:", error);
          }

          try {
            scanner.clear();
          } catch (error) {
            console.warn("Scanner cleanup:", error);
          }
        };

        cleanup();
      }
    };
  }, []);

  const handleScannedCode = async (decodedText) => {
    if (processingRef.current) return;

    processingRef.current = true;
    setProcessing(true);
    setScanError("");
    setCameraError("");
    setResult(null);
    setCameraActive(false);

    // The conference ticket QR contains the registration ID.
    const registrationId = String(decodedText || "")
      .trim()
      .toUpperCase();

    // Stop the camera before sending the API request.
    await stopScanner();

    try {
      if (!registrationId || registrationId.length > 100) {
        throw new Error("Invalid registration QR code.");
      }

      const response = await api.post("/admin/attendance/check-in", {
        registrationId,
      });

      const attendance = response.data?.data?.attendance;

      if (!response.data?.success || !attendance) {
        throw new Error(
          response.data?.message || "Unable to check in attendee.",
        );
      }

      setResult({
        type: "success",
        message: response.data.message,
        attendance,
      });
    } catch (error) {
      const responseData = error.response?.data;
      const attendance = responseData?.data?.attendance;

      if (responseData?.alreadyCheckedIn && attendance) {
        setResult({
          type: "duplicate",
          message:
            responseData.message || "This attendee has already checked in.",
          attendance,
        });
      } else {
        setScanError(
          responseData?.message ||
            error.message ||
            "Unable to process this QR code.",
        );
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const startScanner = async () => {
    if (starting || processing || scannerRef.current) return;

    setStarting(true);
    setCameraError("");
    setScanError("");
    setResult(null);

    let scanner = null;

    try {
      scanner = new Html5Qrcode("attendance-qr-reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewWidth, viewHeight) => {
            const size = Math.floor(
              Math.min(viewWidth, viewHeight, 300) * 0.75,
            );

            return {
              width: size,
              height: size,
            };
          },
          aspectRatio: 1,
        },
        handleScannedCode,
        () => {
          // Ignore unsuccessful frame reads.
        },
      );

      if (mountedRef.current) {
        setCameraActive(true);
      }
    } catch (error) {
      if (scanner && scannerRef.current === scanner) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch {
          // Ignore cleanup errors.
        }

        try {
          scanner.clear();
        } catch {
          // Ignore cleanup errors.
        }

        scannerRef.current = null;
      }

      if (mountedRef.current) {
        setCameraActive(false);
        setCameraError(
          error?.message ||
            "Unable to access the camera. Please check camera permissions.",
        );
      }
    } finally {
      if (mountedRef.current) {
        setStarting(false);
      }
    }
  };

  const attendee = result?.attendance;

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="admin-brand-mark">NM</div>
          <div>
            <h1>Admin Console</h1>
            <p>NextGen Materials Conference</p>
          </div>
        </div>

        <button
          type="button"
          className="admin-manage-button"
          onClick={() => navigate("/admin/attendance/dashboard")}
        >
          <Users size={17} />
          Attendance Records
        </button>

        <button
          type="button"
          className="admin-logout-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">EVENT CHECK-IN</p>
            <h2>Attendance Scanner</h2>
            <p className="admin-heading-description">
              Scan an attendee's conference ticket to record their arrival.
            </p>
          </div>
        </div>

        <div className="admin-scanner-layout">
          <section className="admin-scanner-panel">
            <div className="admin-scanner-heading">
              <div className="admin-scanner-icon">
                <ScanLine size={21} />
              </div>
              <div>
                <h3>Ticket QR scanner</h3>
                <p>
                  Position the attendee's ticket QR code inside the scanning
                  area.
                </p>
              </div>
            </div>

            <div className="admin-scanner-camera-container">
              <div id="attendance-qr-reader" className="admin-qr-reader" />

              {!cameraActive && !starting && (
                <div className="admin-scanner-placeholder">
                  <Camera size={38} />
                  <strong>Camera is not active</strong>
                  <span>Start the scanner to begin check-ins.</span>
                </div>
              )}

              {starting && (
                <div className="admin-scanner-placeholder">
                  <RefreshCw size={28} className="admin-spin" />
                  <strong>Starting camera...</strong>
                </div>
              )}
            </div>

            <div className="admin-scanner-controls">
              {!cameraActive ? (
                <button
                  type="button"
                  className="admin-scanner-start-button"
                  onClick={startScanner}
                  disabled={starting || processing}
                >
                  <Camera size={17} />
                  {starting ? "Starting..." : "Start Scanner"}
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-scanner-stop-button"
                  onClick={stopScanner}
                  disabled={processing}
                >
                  <CameraOff size={17} />
                  Stop Scanner
                </button>
              )}
            </div>

            {cameraError && (
              <div className="admin-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{cameraError}</span>
              </div>
            )}

            {scanError && (
              <div className="admin-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{scanError}</span>
              </div>
            )}

            {processing && (
              <div className="admin-scanner-processing">
                <RefreshCw size={17} className="admin-spin" />
                Validating ticket and recording attendance...
              </div>
            )}
          </section>

          <section className="admin-scanner-result-panel">
            <div className="admin-scanner-heading">
              <div className="admin-scanner-icon">
                <UserRound size={21} />
              </div>
              <div>
                <h3>Check-in result</h3>
                <p>Attendee details and arrival confirmation.</p>
              </div>
            </div>

            {!result ? (
              <div className="admin-scanner-empty-result">
                <UserRound size={34} />
                <strong>No attendee scanned yet</strong>
                <span>
                  The attendee's details will appear here after scanning.
                </span>
              </div>
            ) : (
              <div className="admin-attendance-result">
                <div
                  className={`admin-attendance-result-status ${result.type}`}
                >
                  {result.type === "success" ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <AlertCircle size={22} />
                  )}

                  <div>
                    <strong>
                      {result.type === "success"
                        ? "Check-in successful"
                        : "Already checked in"}
                    </strong>
                    <span>{result.message}</span>
                  </div>
                </div>

                <div className="admin-attendance-person">
                  <h3>{attendee?.name || "Unknown attendee"}</h3>
                  <p>{attendee?.registrationId || "—"}</p>
                </div>

                <div className="admin-attendance-details">
                  <div>
                    <Hash size={16} />
                    <span>Roll number</span>
                    <strong>{attendee?.rollNumber || "—"}</strong>
                  </div>

                  <div>
                    <Building2 size={16} />
                    <span>Department</span>
                    <strong>{attendee?.department || "—"}</strong>
                  </div>

                  <div>
                    <GraduationCap size={16} />
                    <span>Year</span>
                    <strong>{attendee?.year || "—"}</strong>
                  </div>

                  <div>
                    <Clock3 size={16} />
                    <span>Arrival time</span>
                    <strong>{formatDate(attendee?.checkedInAt)}</strong>
                  </div>
                </div>

                {result.type === "duplicate" && (
                  <p className="admin-duplicate-note">
                    The original arrival time has been preserved. No duplicate
                    attendance record was created.
                  </p>
                )}

                <button
                  type="button"
                  className="admin-scanner-next-button"
                  onClick={() => {
                    setResult(null);
                    setScanError("");
                    setCameraError("");
                    startScanner();
                  }}
                  disabled={starting || processing}
                >
                  <ScanLine size={17} />
                  Scan Next Ticket
                </button>
              </div>
            )}
          </section>
        </div>

        <p className="admin-scanner-note">
          Only valid registered attendees can be checked in. Each registration
          ID can be checked in once.
        </p>
      </section>
    </main>
  );
}
