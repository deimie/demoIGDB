import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="portfolio-section">
      <h2>Contact</h2>
      <p>If you'd like to work together or just say hi, reach out:</p>
      <div className="contact-list">
        <a className="btn" href="mailto:you@example.com">Email</a>
        <a className="btn" href="#">LinkedIn</a>
        <a className="btn" href="#">GitHub</a>
      </div>
    </section>
  );
}
