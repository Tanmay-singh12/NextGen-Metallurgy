import React from "react";
import {
  ArrowUpRight,
  Menu,
  X,
  Atom,
} from "lucide-react";
import "./Navbar.css";

const nav = [
  "About",
  "Schedule",
  "Gallery",
  "Team",
  "Contact",
];

export default function Navbar({
  menu,
  setMenu,
  jump,
  onRegister,
}) {
  return (
    <>
      <header className="nav">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            jump("top");
          }}
          aria-label="Metallum home"
        >
          <span className="brand-mark">
            <span className="mark-orbit orbit-a"></span>
            <span className="mark-orbit orbit-b"></span>
            <Atom size={22} />
          </span>

          <span>
            COALESCENCE
          </span>
        </a>

        <nav>
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => jump(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          className="register mini"
          onClick={onRegister}
        >
          Register
          <ArrowUpRight size={15} />
        </button>

        <button
          className="menu"
          aria-label="Open navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      {menu && (
        <div className="mobile-nav">
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => {
                setMenu(false);
                jump(item);
              }}
            >
              {item}
            </button>
          ))}

          <button
            className="register"
            onClick={onRegister}
          >
            Register now
            <ArrowUpRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}