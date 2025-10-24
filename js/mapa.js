const map = L.map('map').setView([19.284, -99.738], 13);

    // 🌍 Capa base: OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 📍 Marcador principal
    const marker = L.marker([19.284, -99.738]).addTo(map);
    marker.bindPopup("<b>Zinacantepec</b><br>Centro del municipio").openPopup();

    // 🟩 Zonas coloreadas (ejemplo)
    const zonas = [
      { 
        nombre: "Zona Norte", 
        coords: [[19.29, -99.75], [19.295, -99.75], [19.295, -99.74], [19.29, -99.74]], 
        color: "orange", 
        tooltip: "Precipitación: 700 mm/año<br>Escasez: Media" 
      },
      { 
        nombre: "Zona Sur", 
        coords: [[19.278, -99.74], [19.283, -99.74], [19.283, -99.73], [19.278, -99.73]], 
        color: "green", 
        tooltip: "Precipitación: 600 mm/año<br>Escasez: Alta" 
      }
    ];

    // 🧭 Dibujar las zonas
    zonas.forEach(z => {
      const poly = L.polygon(z.coords, { color: z.color, fillOpacity: 0.4 }).addTo(map);
      poly.bindPopup(`<b>${z.nombre}</b><br>${z.tooltip}`);
    });

    // 🧾 Leyenda del mapa
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <b>Leyenda:</b><br>
        <span style="color:green;">■</span> Baja escasez<br>
        <span style="color:orange;">■</span> Media escasez<br>
      `;
      return div;
    };
    legend.addTo(map);

document.addEventListener('DOMContentLoaded', function () {
    const mapEl = document.getElementById('map');
    const infoEl = document.getElementById('zone-info');
    const infoContent = document.getElementById('zone-info-content');
    const infoClose = document.getElementById('zone-info-close');
    if (!mapEl) return;

    // Evitar 404 por iconos locales (usa CDN)
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    // Reutilizar instancia si existe
    if (!window._pluvialMap) {
        const centro = [19.284, -99.738];
        const zoom = 12;
        const map = L.map('map', { center: centro, zoom, preferCanvas: true });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Definición de zonas (id único, nombre, datos y coords)
        const zonas = [
            {
                id: 'norte',
                nombre: 'Zona Norte',
                precipitacion: '700 mm/año',
                descripcion: 'Área con precipitación moderada y buena aptitud para captación.',
                coords: [[19.29, -99.75],[19.295, -99.75],[19.295, -99.74],[19.29, -99.74]],
                color: 'orange'
            },
            {
                id: 'sur',
                nombre: 'Zona Sur',
                precipitacion: '600 mm/año',
                descripcion: 'Área con precipitación menor; requiere sistemas de almacenamiento mayores.',
                coords: [[19.278, -99.74],[19.283, -99.74],[19.283, -99.73],[19.278, -99.73]],
                color: 'green'
            }
        ];

        // Crear polígonos y añadir interacción
        zonas.forEach(z => {
            const poly = L.polygon(z.coords, {
                color: z.color,
                fillColor: z.color,
                fillOpacity: 0.35,
                weight: 2
            }).addTo(map);

            // resaltar al pasar el mouse
            poly.on('mouseover', function () {
                this.setStyle({ weight: 4, fillOpacity: 0.55 });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) this.bringToFront();
            });
            poly.on('mouseout', function () {
                this.setStyle({ weight: 2, fillOpacity: 0.35 });
            });

            // click: mostrar/ocultar panel de info
            poly.on('click', function (e) {
                // evitar que el click en la zona cierre el panel por el handler del mapa
                L.DomEvent.stopPropagation(e);

                // si el panel ya muestra esta zona, ocultar; si no, mostrar
                const currentlyOpen = infoEl.classList.contains('open') && infoEl.dataset.zoneId === z.id;
                if (currentlyOpen) {
                    hideZoneInfo();
                    return;
                }
                showZoneInfo(z, poly);
            });
        });

        // guardar instancia global
        window._pluvialMap = map;
    }

    const map = window._pluvialMap;

    // Mostrar panel con datos de la zona
    function showZoneInfo(zone, layer) {
        if (!infoEl || !infoContent) return;
        infoContent.innerHTML = `
            <h4>${zone.nombre}</h4>
            <div class="meta">Precipitación: <strong>${zone.precipitacion}</strong></div>
            <p>${zone.descripcion}</p>
            <p style="margin-top:0.6rem;"><button id="zone-zoom-btn">Centrar zona</button></p>
        `;
        infoEl.dataset.zoneId = zone.id;
        infoEl.classList.add('open');
        infoEl.setAttribute('aria-hidden', 'false');

        // botón centrar
        const zoomBtn = document.getElementById('zone-zoom-btn');
        if (zoomBtn && layer) {
            zoomBtn.addEventListener('click', () => {
                const bounds = layer.getBounds();
                map.fitBounds(bounds, { padding: [20,20] });
            });
        }
    }

    function hideZoneInfo() {
        if (!infoEl) return;
        infoEl.classList.remove('open');
        infoEl.dataset.zoneId = '';
        infoEl.setAttribute('aria-hidden', 'true');
    }

    // cerrar al clicar fuera del polígono (clic en el mapa)
    map.on('click', function () {
        hideZoneInfo();
    });

    // cerrar con el botón
    if (infoClose) infoClose.addEventListener('click', hideZoneInfo);

    // forzar invalidateSize si el contenedor cambia
    function safeInvalidate(retries = 6) {
        const r = mapEl.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) { if (map) map.invalidateSize(); return; }
        if (retries > 0) setTimeout(() => safeInvalidate(retries - 1), 150);
    }
    setTimeout(() => safeInvalidate(6), 250);
    window.addEventListener('resize', () => { setTimeout(() => { if (map) map.invalidateSize(); }, 200); });
});