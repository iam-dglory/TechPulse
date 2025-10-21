import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>
              <span className="logo-icon">⚡</span> TexhPulze
            </h3>
            <p>
              World's First Public Grievance & Discussion Platform for Technology.
              Empowering democracy through technology accountability.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#news">AI News Aggregation</a></li>
              <li><a href="#grievances">Technology Grievances</a></li>
              <li><a href="#discussions">Community Discussions</a></li>
              <li><a href="#ecosystem">Multi-User Ecosystem</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" aria-label="Twitter">🐦 Twitter</a>
              <a href="#" aria-label="LinkedIn">💼 LinkedIn</a>
              <a href="#" aria-label="GitHub">💻 GitHub</a>
            </div>
            <p className="contact-info">
              <a href="mailto:support@texhpulze.com">support@texhpulze.com</a>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} TexhPulze. All rights reserved.</p>
          <p className="footer-credits">
            Powered by AI · Built for Democracy
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
