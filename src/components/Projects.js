import React from 'react';

const sampleProjects = [
  {
    title: 'Project One',
    desc: 'A small app that demonstrates a useful feature. Built with React.'
  },
  {
    title: 'Project Two',
    desc: 'Another project focusing on responsive UI and accessibility.'
  }
];

export default function Projects() {
  return (
    <section id="projects" className="portfolio-section">
      <h2>Projects</h2>
      <div className="projects-grid">
        {sampleProjects.map((p) => (
          <article key={p.title} className="project-card">
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
            <p>
              <a href="#" className="btn">View</a>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
