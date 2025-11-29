function setCoockie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.getElementById('registro-Form').addEventListener('submit', async function(event){
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const correo = document.getElementById('correo').value.trim(); 
    const psw = document.getElementById('psw').value;
    const psw2 = document.getElementById('psw2').value;

    if (psw !== psw2) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (psw.length < 4) {
        alert('La contraseña debe tener al menos 4 caracteres.');
        return;
    }

    try{
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, correo, psw })
        });
        
        const data = await response.json();
        
        if(response.ok){
            if(data.success){
                setCoockie('usuarioId', data.usuarioId, 7);
                window.location.href = '/index';
            }else{
                throw new Error('Error al registrar usuario');
            }
        }
    }catch(error){
        console.error('Error al registrar usuario:', error);
        alert('Error al registrar usuario. Por favor, intente de nuevo.');
    }
});