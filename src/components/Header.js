import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container nav">
        <div className="brand">Your Name</div>
        <nav>
          <a className="btn" href="#contact">Contact</a>
        </nav>
      </div>

      <div className="container hero">
        <h1>Hi, I'm Your Name — a front-end developer</h1>
        <p> I build modern, accessible web apps with a focus on simplicity and performance.</p>
        <a className="btn" href="#projects">See projects</a>
      </div>
    </header>
  );
}
