/**
 * SEO Component
 *
 * Dynamically manages meta tags, Open Graph tags, and structured data for each page
 * Usage: <SEO title="Page Title" description="..." />
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SEO({
  title = 'TexhPulze - Technology Grievance & Discussion Platform',
  description = 'World\'s First Public Grievance & Discussion Platform for Technology. Empowering citizens, researchers, policymakers, and governments to report, discuss, and categorize technology risks using AI-powered tools.',
  keywords = 'technology news, tech grievances, AI news aggregation, technology platform, tech discussion, government tech, technology risks, tech policy, community forum, tech democracy',
  author = 'TexhPulze Team',
  image = 'https://www.texhpulze.com/og-image.jpg',
  type = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
  structuredData = null,
}) {
  const location = useLocation();
  const canonicalUrl = `https://www.texhpulze.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          element.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        } else if (selector.includes('name=')) {
          element.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Update primary meta tags
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="author"]', 'content', author);

    // Robots meta
    const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
    updateMetaTag('meta[name="robots"]', 'content', robotsContent);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[property="og:type"]', 'content', type);
    updateMetaTag('meta[property="og:image"]', 'content', image);
    updateMetaTag('meta[property="og:site_name"]', 'content', 'TexhPulze');

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'content', twitterCard);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:image"]', 'content', image);
    updateMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-page-specific]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-page-specific', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Remove page-specific structured data on unmount
      const script = document.querySelector('script[type="application/ld+json"][data-page-specific]');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, author, image, type, twitterCard, noindex, nofollow, canonicalUrl, structuredData]);

  return null; // This component doesn't render anything
}

export default SEO;
