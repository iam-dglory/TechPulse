import SEO from '../components/SEO';

function About() {
  // Structured data for About page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About TexhPulze",
    "description": "Learn about TexhPulze, the world's first public grievance and discussion platform for technology, empowering citizens, researchers, policymakers, and governments.",
    "url": "https://www.texhpulze.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "TexhPulze",
      "alternateName": "TechPulze",
      "url": "https://www.texhpulze.com",
      "logo": "https://www.texhpulze.com/favicon.svg",
      "description": "World's First Public Grievance & Discussion Platform for Technology",
      "foundingDate": "2025",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@texhpulze.com",
        "contactType": "Customer Support",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://twitter.com/texhpulze",
        "https://linkedin.com/company/texhpulze",
        "https://github.com/texhpulze"
      ]
    }
  };

  return (
    <div className="about-page">
      <SEO
        title="About TexhPulze - Technology Grievance Platform | Mission & Vision"
        description="Discover TexhPulze's mission to democratize technology governance. Learn how our AI-powered platform empowers citizens to report tech issues, engage in discussions, and shape technology policy. Multi-source news aggregation, community forums, and direct government integration."
        keywords="about texhpulze, technology governance, tech democracy, AI news platform, technology grievances, tech policy platform, community technology forum, technology accountability"
        type="website"
        structuredData={structuredData}
      />
      <section className="page-hero">
        <div className="container">
          <h1>About TexhPulze</h1>
          <p className="subtitle">
            World's First Public Grievance & Discussion Platform for Technology
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="content-section">
            <h2>Our Mission</h2>
            <p>
              TexhPulze combines the power of AI news aggregation with community-driven
              technology grievance reporting and discussion forums. We empower citizens,
              researchers, policymakers, and governments to report, discuss, and categorize
              technology risks using AI-powered tools.
            </p>
          </div>

          <div className="content-section">
            <h2>What We Offer</h2>
            <div className="offerings-grid">
              <div className="offering">
                <h3>📰 AI News Aggregation</h3>
                <ul>
                  <li>Multi-source tech news from NewsAPI, Guardian, Dev.to, Hacker News</li>
                  <li>Real-time article updates and categorization</li>
                  <li>Search and filtering by AI, Gadgets, Software, Programming, Startups</li>
                  <li>Personalized news feed with favorites system</li>
                </ul>
              </div>

              <div className="offering">
                <h3>🚨 Technology Grievances</h3>
                <ul>
                  <li>Report technology-related problems</li>
                  <li>AI risk categorization and classification</li>
                  <li>Direct reporting to relevant authorities</li>
                  <li>Anonymous research database for policymakers</li>
                </ul>
              </div>

              <div className="offering">
                <h3>💬 Community Discussions</h3>
                <ul>
                  <li>Reddit-like technology discussion boards</li>
                  <li>Verified expert panels and researchers</li>
                  <li>Community-driven discussions</li>
                  <li>Government-policymaker interactions</li>
                </ul>
              </div>

              <div className="offering">
                <h3>👥 Multi-User Ecosystem</h3>
                <ul>
                  <li>Citizens: Report issues and participate</li>
                  <li>Researchers: Access anonymized data</li>
                  <li>Policymakers: Monitor trends and engage</li>
                  <li>Governments: Track grievances and respond</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Technology Stack</h2>
            <div className="tech-stack">
              <div className="stack-category">
                <h4>Frontend</h4>
                <p>React, Vite, React Router, Axios</p>
              </div>
              <div className="stack-category">
                <h4>Backend</h4>
                <p>Node.js, Express, MySQL, Redis, JWT</p>
              </div>
              <div className="stack-category">
                <h4>AI/ML</h4>
                <p>OpenAI API, NLP, Sentiment Analysis</p>
              </div>
              <div className="stack-category">
                <h4>Infrastructure</h4>
                <p>Vercel, Render, Docker</p>
              </div>
            </div>
          </div>

          <div className="content-section cta-section">
            <h2>Join the Movement</h2>
            <p>
              Be part of the world's first platform democratizing technology governance.
              Together, we can make technology safer and more accountable for everyone.
            </p>
            <div className="cta-buttons">
              <a href="/" className="btn btn-primary">Get Started</a>
              <a href="/contact" className="btn btn-secondary">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
