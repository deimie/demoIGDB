import React from 'react';
import './App.css';
import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  return (
    <div className="app-root">
      <Header />

      <main className="container">
        <About />
        <Projects />
        <Contact />
      </main>

      <footer className="site-footer">© {new Date().getFullYear()} Your Name</footer>
    </div>
  );
}

export default App;
