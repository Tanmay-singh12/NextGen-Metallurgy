
import Attendance from "../models/Attendance.js";
import Registration from "../models/Registration.js";

const normalizeRegistrationId = (value) =>
  typeof value === "string"
    ? value.trim().toUpperCase()
    : "";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/v1/admin/attendance/check-in
export const checkInAttendee = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(
      req.body?.registrationId
    );

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    // Verify that the ticket belongs to a registered attendee.
    const registration = await Registration.findOne({
      registrationId,
    }).select(
      "registrationId name email rollNumber department year"
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "No registration found for this QR code.",
      });
    }

    // Check whether the attendee has already checked in.
    const existingAttendance = await Attendance.findOne({
      registrationId,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        alreadyCheckedIn: true,
        message: "This attendee has already checked in.",
        data: {
          attendance: existingAttendance,
        },
      });
    }

    // Server generates the official arrival timestamp.
    try {
      const attendance = await Attendance.create({
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email || "",
        rollNumber: registration.rollNumber || "",
        department: registration.department || "",
        year: registration.year || "",
        checkedInAt: new Date(),
        checkedInBy: req.admin.id,
      });

      return res.status(201).json({
        success: true,
        alreadyCheckedIn: false,
        message: "Attendee checked in successfully.",
        data: {
          attendance,
        },
      });
    } catch (error) {
      // Unique index protects against simultaneous duplicate scans.
      if (error.code === 11000) {
        const attendance = await Attendance.findOne({
          registrationId,
        });

        return res.status(409).json({
          success: false,
          alreadyCheckedIn: true,
          message: "This attendee has already checked in.",
          data: {
            attendance,
          },
        });
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/attendance

const parseDateFilter = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date;
};

// GET /api/v1/admin/attendance
export const listAttendance = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const startDate = parseDateFilter(req.query.startDate);
    const endDate = parseDateFilter(req.query.endDate);

    if (startDate === false || endDate === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date filter.",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date must not be after end date.",
      });
    }

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { name: searchRegex },
        { registrationId: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
        { department: searchRegex },
      ];
    }

    if (startDate || endDate) {
      filter.checkedInAt = {};

      if (startDate) {
        filter.checkedInAt.$gte = startDate;
      }

      if (endDate) {
        filter.checkedInAt.$lte = endDate;
      }
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .select("-__v")
        .sort({ checkedInAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Attendance.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        attendance,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/attendance/stats
export const getAttendanceStats = async (req, res, next) => {
  try {
    // Conference day boundaries use India Standard Time.
    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const todayStart = new Date(
      `${indiaDate}T00:00:00.000+05:30`
    );

    const tomorrowStart = new Date(
      todayStart.getTime() + 24 * 60 * 60 * 1000
    );

    const [totalCheckIns, todayCheckIns, latestArrival] =
      await Promise.all([
        Attendance.countDocuments(),

        Attendance.countDocuments({
          checkedInAt: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        }),

        Attendance.findOne()
          .sort({ checkedInAt: -1 })
          .select(
            "name registrationId rollNumber department checkedInAt"
          )
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCheckIns,
        todayCheckIns,
        latestArrival,
      },
    });
  } catch (error) {
    next(error);
  }
};
