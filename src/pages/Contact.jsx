import { useState } from 'react';
import SEO from '../components/SEO';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual form submission to backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Structured data for Contact page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact TexhPulze",
    "description": "Get in touch with the TexhPulze team for support, business inquiries, or technology grievance reporting",
    "url": "https://www.texhpulze.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "TexhPulze",
      "email": "support@texhpulze.com",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "email": "support@texhpulze.com",
          "contactType": "Customer Support",
          "availableLanguage": "English"
        },
        {
          "@type": "ContactPoint",
          "email": "business@texhpulze.com",
          "contactType": "Business Inquiries",
          "availableLanguage": "English"
        }
      ]
    }
  };

  return (
    <div className="contact-page">
      <SEO
        title="Contact TexhPulze - Get in Touch | Support & Business Inquiries"
        description="Contact the TexhPulze team for support, partnerships, or technology grievance assistance. Email us at support@texhpulze.com or fill out our contact form. We're here to help with tech issues, platform questions, and collaboration opportunities."
        keywords="contact texhpulze, tech support, technology help, report tech issues, business inquiries, tech platform support, grievance reporting contact"
        type="website"
        structuredData={structuredData}
      />
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="subtitle">
            Get in touch with the TexhPulze team
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Have questions about TexhPulze? Want to report a technology grievance?
                Need assistance? We're here to help!
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-details">
                    <h3>Email</h3>
                    <p>support@texhpulze.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">🌐</div>
                  <div className="method-details">
                    <h3>Website</h3>
                    <p>www.texhpulze.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">💼</div>
                  <div className="method-details">
                    <h3>Business Inquiries</h3>
                    <p>business@texhpulze.com</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="#" aria-label="Twitter">🐦</a>
                  <a href="#" aria-label="LinkedIn">💼</a>
                  <a href="#" aria-label="GitHub">💻</a>
                  <a href="#" aria-label="Facebook">📘</a>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Send Us a Message</h2>
              {submitted && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent successfully.
                </div>
              )}
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
