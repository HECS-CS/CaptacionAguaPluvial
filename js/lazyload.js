document.addEventListener('DOMContentLoaded', function () {
  // Forzar loading=lazy en todas las imágenes modernas
  document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy'); });

  // Lazy-load para imágenes con data-src (mejor control)
  const lazyImages = [].slice.call(document.querySelectorAll('img[data-src]'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '120px' });
    lazyImages.forEach(img => observer.observe(img));
  } else {
    // Fallback: cargar todas tras short timeout
    setTimeout(() => lazyImages.forEach(img => { img.src = img.dataset.src; if (img.dataset.srcset) img.srcset = img.dataset.srcset; }), 300);
  }
});