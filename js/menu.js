document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');

    if (!btn || !nav) return;

    btn.addEventListener('click', function (e) {
        const isOpen = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        e.stopPropagation();
    });

    // Cerrar al hacer click fuera (solo en móvil/tablet)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1024 && nav.classList.contains('open')) {
            if (!nav.contains(e.target) && e.target !== btn) {
                nav.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            nav.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    // En cambio de tamaño a desktop, asegurar nav visible y estado limpio
    window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
            nav.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
});