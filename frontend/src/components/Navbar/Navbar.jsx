import React from 'react';
import { ArrowUpRight, Menu, X, Atom } from 'lucide-react';
import './Navbar.css';

const nav = ['About', 'Events', 'Schedule', 'Gallery', 'Team', 'Contact'];

export default function Navbar({ menu, setMenu, jump }) {
  return (
    <>
      <header className="nav">
        <a className="brand" href="#top" onClick={() => jump('top')} aria-label="Metallum home">
          <span className="brand-mark">
            <span className="mark-orbit orbit-a"></span>
            <span className="mark-orbit orbit-b"></span>
            <Atom size={22} />
          </span>
          <span>SYMPOSIUM</span>
        </a>
        <nav>{nav.map(x => <button key={x} onClick={() => jump(x)}>{x}</button>)}</nav>
        <button className="register mini" onClick={() => jump('contact')}>Register <ArrowUpRight size={15} /></button>
        <button className="menu" aria-label="Open navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
      </header>
      {menu && (
        <div className="mobile-nav">
          {nav.map(x => <button key={x} onClick={() => jump(x)}>{x}</button>)}
          <button className="register" onClick={() => jump('contact')}>Register now <ArrowUpRight size={16} /></button>
        </div>
      )}
    </>
  );
}
