function calcularAgua() {
    const area = parseFloat(document.getElementById('area').value);
    const precipitacionMM = parseFloat(document.getElementById('precipitacion').value);
    const coeficiente = parseFloat(document.getElementById('coeficiente').value);

    if (isNaN(area) || isNaN(precipitacionMM) || isNaN(coeficiente) || area <= 0 || precipitacionMM <= 0) {
        alert("Por favor, introduce valores numéricos válidos y positivos en todos los campos.");
        return; 
    }


    const precipitacionMetros = precipitacionMM / 1000;

    const volumenTotalM3 = area * precipitacionMetros;

    const volumenUtilM3 = volumenTotalM3 * coeficiente;

    const litrosFinales = volumenUtilM3 * 1000;

    const resultadoElemento = document.querySelector('#resultado span');
    
    resultadoElemento.textContent = litrosFinales.toFixed(2) + ' L';
}

document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const areaEl = $('#area');
  const precEl = $('#precipitacion');
  const coefEl = $('#coeficiente') || $('#eficiencia') || $('#eficienciaPorc');
  const costoEl = $('#costo') || null;
  const precioEl = $('#precio_agua') || null;
  const form = $('#calculadora-form') || null;

  let resultadoEl = $('#resultado');
  if (!resultadoEl) {
    resultadoEl = document.createElement('div');
    resultadoEl.id = 'resultado';
    const main = document.querySelector('main') || document.body;
    main.appendChild(resultadoEl);
  }

  const show = (html, isError = false) => {
    resultadoEl.innerHTML = `<div class="${isError?'error-msg':''}">${html}</div>`;
  };

  const fmt = (n, d = 0) => Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : '—';

  const debounce = (fn, wait = 300) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  };

  function readValues() {
    try {
      const area = Number(areaEl?.value || 0);
      const precipitacion = Number(precEl?.value || 0);
      let coef = Number(coefEl?.value ?? 0);
      // aceptar coef como 0.85 o 85 => normalizar
      if (coef > 1 && coef <= 100) coef = coef / 100;
      if (coef > 100) coef = 1; // protección
      const costo = costoEl ? Number(costoEl.value || 0) : 0;
      const precio = precioEl ? Number(precioEl.value || 0) : 0;
      return { area, precipitacion, coef, costo, precio };
    } catch (err) {
      throw new Error('Error al leer inputs');
    }
  }

  function computeAndRender(save = true) {
    try {
      const { area, precipitacion, coef, costo, precio } = readValues();
      if (!(area > 0) || !(precipitacion > 0) || !(coef > 0)) {
        show('Introduce valores válidos: área, precipitación y coeficiente/eficiencia.', true);
        return;
      }

      // 1 mm sobre 1 m² = 1 L
      const litrosAnuales = area * precipitacion * coef;
      const litrosMensuales = litrosAnuales / 12;
      const ahorroAnual = precio ? litrosAnuales * precio : 0;
      const anosRecuperacion = ahorroAnual > 0 ? (costo / ahorroAnual) : Infinity;
      const roiPorc = costo > 0 ? (ahorroAnual / costo) * 100 : 0;

      const equivalencias = [
        { label: 'Garrafones (20 L)', v: litrosAnuales / 20 },
        { label: 'Duchas promedio (50 L)', v: litrosAnuales / 50 },
        { label: 'Descargas WC (6 L)', v: litrosAnuales / 6 },
        { label: 'Lavadoras (60 L)', v: litrosAnuales / 60 },
        { label: 'Riego 1 m² (10 L)', v: litrosAnuales / 10 },
        { label: 'Botellas 1.5 L', v: litrosAnuales / 1.5 }
      ];

      const html = `
        <h3>Resultados</h3>
        <p>Captación estimada: <strong>${fmt(litrosAnuales,0)} L/año</strong> (${fmt(litrosMensuales,0)} L/mes)</p>
        <p>Ahorro estimado: <strong>${fmt(ahorroAnual,2)}</strong> /año</p>
        <p>Tiempo de recuperación: <strong>${isFinite(anosRecuperacion)?fmt(anosRecuperacion,2)+' años':'No recuperable'}</strong></p>
        <p>ROI anual: <strong>${fmt(roiPorc,2)} %</strong></p>
        <h4>Equivalencias</h4>
        <ul>${equivalencias.map(e => `<li>${e.label}: <strong>${fmt(e.v,1)}</strong></li>`).join('')}</ul>
      `;
      show(html);

      if (save) guardarHistorial({ area, precipitacion, coef, costo, precio }, { litrosAnuales, ahorroAnual, anosRecuperacion, roiPorc });
    } catch (err) {
      console.error(err);
      show('Error al calcular. Revisa los valores e intenta de nuevo.', true);
    }
  }

  function guardarHistorial(inputs, resultados) {
    try {
      const key = 'captacion_historial';
      const raw = localStorage.getItem(key);
      const lista = raw ? JSON.parse(raw) : [];
      lista.unshift({
        id: Date.now(),
        ts: new Date().toISOString(),
        inputs,
        resultados
      });
      if (lista.length > 10) lista.length = 10;
      localStorage.setItem(key, JSON.stringify(lista));
    } catch (err) {
      console.warn('No se pudo guardar historial', err);
    }
  }

  const debouncedCompute = debounce(() => computeAndRender(false), 350);

  // conectar eventos
  [areaEl, precEl, coefEl, costoEl, precioEl].forEach(el => {
    if (!el) return;
    el.addEventListener('input', debouncedCompute);
    el.addEventListener('change', () => computeAndRender(false));
  });

  if (form) {
    form.addEventListener('submit', e => { e.preventDefault(); computeAndRender(true); });
  } else {
    // si no hay form, ejecutar cálculo inicial al cargar si hay valores
    setTimeout(() => computeAndRender(false), 220);
  }
});