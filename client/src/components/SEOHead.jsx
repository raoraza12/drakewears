import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'DRAKEWEARS | Modern Luxury Streetwear & Apparel';
const DEFAULT_DESC = 'Discover premium streetwear, heavyweight drop shoulder tees, baggy cargo trousers, and luxury apparel at DRAKEWEARS Pakistan. Free shipping on orders over Rs. 5,000.';
const DEFAULT_IMAGE = 'https://drakewears.vercel.app/carousel-gymwears.jpg';
const SITE_URL = 'https://drakewears.com';

function setMetaTag(selector, attrName, attrValue, content) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    const finalTitle = title ? (title.includes('DRAKEWEARS') ? title : `${title} | DRAKEWEARS`) : DEFAULT_TITLE;
    document.title = finalTitle;

    // 2. Meta Description & Keywords
    const finalDesc = description || DEFAULT_DESC;
    setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);
    
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    // 3. Canonical URL
    const canonicalUrl = url || `${SITE_URL}${location.pathname}`;
    setCanonical(canonicalUrl);

    // 4. OpenGraph Tags (WhatsApp, Facebook, LinkedIn)
    const finalImage = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE;
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'DRAKEWEARS');

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);

    // 6. Schema.org JSON-LD Structured Data
    const SCRIPT_ID = 'drake-schema-jsonld';
    let scriptTag = document.getElementById(SCRIPT_ID);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup when component unmounts
    return () => {
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) existingScript.remove();
    };
  }, [title, description, keywords, image, url, type, schema, location.pathname]);

  return null;
}
