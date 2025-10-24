document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contacto-form');
    const mensaje = document.getElementById('mensaje-enviado');
    if(form && mensaje) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Validación básica
            const nombre = form.nombre.value.trim();
            const email = form.email.value.trim();
            const comentario = form.comentario.value.trim();
            // Expresión regular simple para validar email
            const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if(!nombre || !email || !comentario) {
                mensaje.textContent = 'Por favor, completa todos los campos.';
                mensaje.classList.add('error');
                mensaje.style.display = 'block';
                mensaje.style.animation = 'none';
                void mensaje.offsetWidth;
                mensaje.style.animation = null;
                setTimeout(() => {
                    mensaje.style.display = 'none';
                    mensaje.classList.remove('error');
                }, 2000);
                return;
            }
            if(!emailValido) {
                mensaje.textContent = 'Por favor, ingresa un correo válido.';
                mensaje.classList.add('error');
                mensaje.style.display = 'block';
                mensaje.style.animation = 'none';
                void mensaje.offsetWidth;
                mensaje.style.animation = null;
                setTimeout(() => {
                    mensaje.style.display = 'none';
                    mensaje.classList.remove('error');
                }, 2000);
                return;
            }
            // Éxito
            mensaje.textContent = 'Tu comentario fue enviado';
            mensaje.classList.remove('error');
            mensaje.style.display = 'block';
            mensaje.style.animation = 'none';
            void mensaje.offsetWidth;
            mensaje.style.animation = null;
            setTimeout(() => {
                mensaje.style.display = 'none';
                form.reset();
            }, 2000);
        });
    }
});