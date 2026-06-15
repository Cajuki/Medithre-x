import { useEffect } from 'react';

const setTag = (attr, name, content) => {
  const selector = attr === 'property'
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let element = document.head.querySelector(selector);

  if (!content) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export default function Seo({
  title,
  description,
  url,
  image,
  type = 'website',
  noindex = false,
  keywords = 'medical equipment Kenya, laboratory equipment Kenya, hospital supplies, diagnostic equipment, medithrex'
}) {
  useEffect(() => {
    const appName = import.meta.env.VITE_APP_NAME || 'Medithrex';
    const siteTitle = title ? `${title} | ${appName}` : `${appName} — Medical & Laboratory Equipment Kenya`;
    document.title = siteTitle;

    setTag('name', 'description', description || 'Medithrex supplies medical and laboratory equipment across Kenya with fast delivery, support, and trusted brands.');
    setTag('name', 'keywords', keywords);
    setTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setTag('property', 'og:type', type);
    setTag('property', 'og:title', siteTitle);
    setTag('property', 'og:description', description || 'Medithrex supplies medical and laboratory equipment across Kenya with fast delivery, support, and trusted brands.');
    setTag('property', 'og:url', url || window.location.href);
    setTag('property', 'og:site_name', appName);
    setTag('property', 'og:image', image || '');
    setTag('name', 'twitter:image', image || '');
    setTag('name', 'twitter:card', 'summary_large_image');
    setTag('name', 'twitter:title', siteTitle);
    setTag('name', 'twitter:description', description || 'Medithrex supplies medical and laboratory equipment across Kenya with fast delivery, support, and trusted brands.');
    setLink('canonical', url || window.location.href);
  }, [title, description, url, image, type, noindex, keywords]);

  return null;
}
