// --- static/js/ejercicios.js ---

// Mapeo corregido según tu imagen de la tabla 'categoria'
const MUSCLE_TO_CATEGORY_ID = {
    'pecho': 1,
    'espalda': 2,
    'pierna': 3,   
    'brazos': 4,
    'hombro': 5,   
    'gluteos': 6,
    'abdomen': 7
};

// --- Elementos del DOM ---
const musculoSelector = document.getElementById('musculo-selector');
const listaEjerciciosContainer = document.getElementById('lista-ejercicios-seleccion');
const nombreEjercicioElement = document.getElementById('nombre-ejercicio');
const descripcionEjercicioElement = document.getElementById('descripcion-ejercicio');
const musculoPrincipalElement = document.getElementById('musculo-principal');

// --- 1. Obtener Ejercicios por Categoría ---
async function getEjerciciosPorCategoria(id_categoria) {
    if (!id_categoria) {
        listaEjerciciosContainer.innerHTML = '<p class="text-muted">Selecciona un músculo válido.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/ejercicios/${id_categoria}`);
        const data = await response.json();

        if (data.success) {
            renderEjerciciosList(data.ejercicios);
        } else {
            listaEjerciciosContainer.innerHTML = '<p>Error al cargar ejercicios.</p>';
            console.error('Error:', data.message);
        }
    } catch (error) {
        listaEjerciciosContainer.innerHTML = '<p>Error de conexión.</p>';
        console.error('Error fetch:', error);
    }
}

// --- 2. Renderizar la Lista de Ejercicios ---
function renderEjerciciosList(ejercicios) {
    listaEjerciciosContainer.innerHTML = ''; // Limpiar lista anterior

    if (ejercicios.length === 0) {
        listaEjerciciosContainer.innerHTML = '<p>No hay ejercicios para este músculo.</p>';
        limpiarDetalles();
        return;
    }

    // Cargar detalles del primer ejercicio por defecto
    if (ejercicios.length > 0) {
        // CAMBIO: Usamos 'id_ejercicio'
        getDetallesEjercicio(ejercicios[0].id_ejercicio);
    }

    ejercicios.forEach((ejercicio, index) => {
        const opcionDiv = document.createElement('div');
        opcionDiv.className = 'opcion';

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        // CAMBIO: Usamos 'id_ejercicio'
        radioInput.id = `ejercicio-${ejercicio.id_ejercicio}`;
        radioInput.name = 'ejercicio';
        radioInput.value = ejercicio.id_ejercicio; 
        
        if (index === 0) radioInput.checked = true;

        const label = document.createElement('label');
        label.htmlFor = `ejercicio-${ejercicio.id_ejercicio}`;
        label.textContent = ejercicio.nombre;
        label.style.cursor = "pointer"; // Mejora visual

        opcionDiv.appendChild(radioInput);
        opcionDiv.appendChild(label);
        listaEjerciciosContainer.appendChild(opcionDiv);
    });
}

// --- 3. Obtener y Mostrar Detalles ---
async function getDetallesEjercicio(id_ejercicio) {
    if (!id_ejercicio) return;
    
    // Feedback visual de carga
    nombreEjercicioElement.textContent = "Cargando...";
    
    try {
        const response = await fetch(`/api/ejercicios/detalle/${id_ejercicio}`); 
        const data = await response.json();

        if (data.success && data.ejercicio) {
            const ej = data.ejercicio;
            nombreEjercicioElement.textContent = ej.nombre;
            descripcionEjercicioElement.textContent = ej.descripcion || 'Sin descripción disponible.';
            musculoPrincipalElement.textContent = `Categoría: ${ej.nombre_categoria}`;
        } else {
            nombreEjercicioElement.textContent = 'Error';
            descripcionEjercicioElement.textContent = 'No se pudo cargar la información.';
        }
    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
}

function limpiarDetalles() {
    nombreEjercicioElement.textContent = 'Selecciona un Ejercicio';
    descripcionEjercicioElement.textContent = '';
    musculoPrincipalElement.textContent = '';
}

// Event Listeners
musculoSelector.addEventListener('change', (event) => {
    const selectedMuscle = event.target.value;
    const categoryId = MUSCLE_TO_CATEGORY_ID[selectedMuscle];
    getEjerciciosPorCategoria(categoryId);
});

listaEjerciciosContainer.addEventListener('change', (event) => {
    if (event.target.name === 'ejercicio') {
        const id_ejercicio = event.target.value;
        getDetallesEjercicio(id_ejercicio);
    }
});