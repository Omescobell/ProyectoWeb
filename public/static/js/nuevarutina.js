document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. CARGAR CATEGORIAS (MÚSCULOS)
    // ==========================================
    fetch('/api/categorias')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('select-musculo-filtro');
            // Validamos que el select exista antes de intentar usarlo
            if(select){
                data.forEach(cat => {
                    const op = document.createElement('option');
                    op.value = cat.id_categoria;
                    op.textContent = cat.nombre;
                    select.appendChild(op);
                });
                cargarEjercicios();
            }
        })
        .catch(err => console.error("Error cargando categorías:", err));

    // ==========================================
    // 2. CARGAR EJERCICIOS
    // ==========================================
    function cargarEjercicios() {
        const select = document.getElementById("select-musculo-filtro");
        const cont = document.getElementById("contenedor-ejercicios-disponibles");

        if(!select || !cont) return; // Evita errores si no encuentra los elementos

        const cat = select.value;
        cont.innerHTML = "Cargando...";

        fetch(`/api/ejercicios?categoria=${cat}`)
            .then(r => r.json())
            .then(ejs => {
                cont.innerHTML = "";
                ejs.forEach(e => {
                    const div = document.createElement("div");
                    div.classList.add("opcion-ejercicio");
                    div.innerHTML = `
                        <input type="checkbox" class="chk-ejercicio" data-id="${e.id_ejercicio}">
                        <label>${e.nombre}</label>
                    `;
                    cont.appendChild(div);
                });
            })
            .catch(err => {
                console.error("Error:", err);
                cont.innerHTML = "Error al cargar ejercicios.";
            });
    }

    const filtroMusculo = document.getElementById("select-musculo-filtro");
    if(filtroMusculo){
        filtroMusculo.addEventListener("change", cargarEjercicios);
    }

    // ==========================================
    // 3. AGREGAR/QUITAR EJERCICIO DE LA TABLA
    // ==========================================
    document.addEventListener("change", e => {
        if (!e.target.classList.contains("chk-ejercicio")) return;

        const tabla = document.getElementById("tabla-nueva-rutina-body");
        if(!tabla) return;

        if (e.target.checked) {
            const fila = document.createElement("tr");
            fila.dataset.id = e.target.dataset.id;
            
            // Obtenemos el nombre del músculo seleccionado
            const selectMusculo = document.getElementById('select-musculo-filtro');
            const nombreMusculo = selectMusculo ? selectMusculo.selectedOptions[0].text : "General";

            fila.innerHTML = `
                <td>${e.target.nextElementSibling.textContent}</td>
                <td><input type="number" class="form-control reps" placeholder="0"></td>
                <td>${nombreMusculo}</td>
                <td><input type="number" class="form-control series" placeholder="0"></td>
            `;
            tabla.appendChild(fila);
        } else {
            // Si desmarca el checkbox, borramos la fila
            const filaABorrar = tabla.querySelector(`tr[data-id="${e.target.dataset.id}"]`);
            if(filaABorrar) filaABorrar.remove();
        }
    });

    // ==========================================
    // 4. GUARDAR RUTINA (POST)
    // ==========================================
    const btnCrear = document.getElementById("btn-crear-rutina");
    if(btnCrear){
        btnCrear.addEventListener("click", () => {
            const inputNombre = document.getElementById("input-nombre-rutina");
            const nombre = inputNombre ? inputNombre.value : "";
            const filas = [...document.querySelectorAll("#tabla-nueva-rutina-body tr")];

            if (!nombre || filas.length === 0) {
                alert("Por favor escribe un nombre para la rutina y selecciona ejercicios.");
                return;
            }

            const ejercicios = filas.map(f => ({
                id_ejercicio: f.dataset.id,
                repeticiones: f.querySelector(".reps").value || 0,
                series: f.querySelector(".series").value || 0,
                descanso_segundos: 60
            }));

            fetch('/api/crear_rutina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, ejercicios })
            })
            .then(r => r.json())
            .then(d => {
                if (!d.success) return alert("Error creando rutina");
                alert("Rutina creada correctamente");
                location.href = "/rutinas";
            })
            .catch(err => console.error("Error en creación:", err));
        });
    }

    // ==========================================
    // 5. IMPRIMIR TABLA ACTUAL A PDF
    // ==========================================
    const btnImprimir = document.getElementById("btn-imprimir-nueva");

    if (btnImprimir) { 
        btnImprimir.addEventListener("click", () => {
            const inputNombre = document.getElementById("input-nombre-rutina");
            const nombreRutina = (inputNombre && inputNombre.value.trim() !== "") ? inputNombre.value : "Mi_Nueva_Rutina";
            
            const elementoOriginal = document.querySelector(".table-responsive");
            const filas = document.querySelectorAll("#tabla-nueva-rutina-body tr");

            if (!elementoOriginal || filas.length === 0) {
                alert("No hay ejercicios en la tabla para imprimir.");
                return;
            }

            // Clonar la tabla para no romper la vista web
            const contenidoClonado = elementoOriginal.cloneNode(true);

            // --- TRUCO: Convertir Inputs a Texto ---
            // Los inputs clonados no llevan el valor escrito por el usuario automáticamente.
            // Tenemos que pasar los valores manualmente y convertirlos a texto plano.
            const inputsOriginales = elementoOriginal.querySelectorAll("input");
            const inputsClonados = contenidoClonado.querySelectorAll("input");

            inputsOriginales.forEach((inputOriginal, index) => {
                if(inputsClonados[index]) {
                    const valor = inputOriginal.value || "0"; 
                    const span = document.createElement("span");
                    span.textContent = valor;
                    span.style.fontWeight = "bold";
                    // Reemplazamos el <input> por un <span> con el número
                    inputsClonados[index].parentNode.replaceChild(span, inputsClonados[index]);
                }
            });

            // Título para el PDF
            const titulo = document.createElement("h2");
            titulo.innerText = nombreRutina;
            titulo.style.textAlign = "center";
            titulo.style.fontFamily = "sans-serif";
            titulo.style.marginBottom = "20px";

            // Contenedor temporal
            const contenedorPDF = document.createElement("div");
            contenedorPDF.appendChild(titulo);
            contenedorPDF.appendChild(contenidoClonado);

            const opciones = {
                margin:       0.5,
                filename:     `${nombreRutina}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf()
                .set(opciones)
                .from(contenedorPDF)
                .save();
        });
    }
});