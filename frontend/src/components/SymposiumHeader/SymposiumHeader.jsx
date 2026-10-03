import React from 'react';
import './SymposiumHeader.css';

export default function SymposiumHeader() {
  return (
    <section className="symposium-header">

      <div className="symposium-logo symposium-logo-left">
        <img
          src="/assets/vnit-logo.png"
          alt="VNIT Nagpur"
        />
      </div>

      <div className="symposium-title">
        

        <h2>SYMPOSIUM</h2>

        <span className="symposium-line"></span>
      </div>

      

    </section>
  );
}