function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/";
}

document.getElementById('login-Form').addEventListener('submit', async function(event){
    event.preventDefault(); 

    const correo = document.getElementById('usr').value; 
    const contrasena = document.getElementById('psw').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contrasena }) 
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            setCookie('usuarioId', data.usuarioId, 7);
            if(data.usuarioNombre) setCookie('usuarioNombre', data.usuarioNombre, 7);

            window.location.href = '/index'; 
        } else {
            throw new Error(data.message || 'Credenciales incorrectas');
        }

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});