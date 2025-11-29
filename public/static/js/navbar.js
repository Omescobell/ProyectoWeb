const getCookie = (name) => document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || null;

const deleteCookie = (name) => {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

document.addEventListener('DOMContentLoaded', () => {
    const userElement = document.getElementById('User');
    const nombreUsuario = getCookie('usuarioNombre');

    if (userElement && nombreUsuario) {
        userElement.textContent = nombreUsuario;
    }
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault(); 

            deleteCookie('usuarioId');
            deleteCookie('usuarioNombre'); 

            window.location.href = '/login';
        });
    }
});