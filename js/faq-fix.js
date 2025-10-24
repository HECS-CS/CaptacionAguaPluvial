document.addEventListener('DOMContentLoaded', () => {
  // Forzar display de tarjetas
  document.querySelectorAll('details.faq-card').forEach(d => d.style.display = 'block');

  // Reintentar carga de imágenes y usar placeholder si falla
  document.querySelectorAll('.faq-media img').forEach((img, idx) => {
    const setPlaceholder = () => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='#f6f9fc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#0b3954' font-family='Poppins,Arial' font-size='20'>Pregunta ${idx+1}</text></svg>`;
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      img.alt = img.alt || `Pregunta ${idx+1}`;
    };

    // si ya cargó correctamente no hacer nada
    if (img.complete && img.naturalWidth > 0) return;

    // manejar error / onload
    img.onerror = setPlaceholder;
    img.onload = () => { if (img.naturalWidth === 0) setPlaceholder(); };

    // intentar forzar recarga (evita cache corrupto)
    const src = img.getAttribute('src');
    if (src) img.src = src + '?_=' + Date.now();
    else setPlaceholder();
  });
});