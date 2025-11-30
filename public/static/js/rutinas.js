document.addEventListener("DOMContentLoaded", () => {
    // 1. Referencias al DOM
    const selectRutina = document.getElementById("select-rutina");
    const tablaBody = document.getElementById("tabla-rutina-body");
    const btnEliminar = document.getElementById("btn-confirmar-eliminar");
    const btnImprimir = document.getElementById("btn-imprimir");

    // ---------------------------
    // Cargar rutinas del usuario
    // ---------------------------
    function cargarRutinas() {
        fetch("/api/rutinas")
            .then(r => r.json())
            .then(data => {
                selectRutina.innerHTML = `<option selected>Selecciona una Rutina</option>`;
                
                data.forEach(r => {
                    selectRutina.innerHTML += `
                        <option value="${r.id_rutina}">
                            ${r.nombre} - ${r.fecha_creacion.substring(0,10)}
                        </option>`;
                });
            })
            .catch(err => console.error("Error cargando rutinas:", err));
    }

    // ---------------------------
    // Cargar detalles de rutina
    // ---------------------------
    selectRutina.addEventListener("change", () => {
        const id = selectRutina.value;

        if (id === "Selecciona una Rutina") {
            tablaBody.innerHTML = ""; // Limpiar si deselecciona
            return;
        }

        fetch(`/api/rutina_detalle?id_rutina=${id}`)
            .then(r => r.json())
            .then(data => {
                tablaBody.innerHTML = "";

                data.forEach(d => {
                    tablaBody.innerHTML += `
                        <tr>
                            <td>${d.ejercicio}</td>
                            <td>${d.repeticiones}</td>
                            <td>${d.categoria}</td>
                            <td>${d.series}</td>
                        </tr>
                    `;
                });
            })
            .catch(err => console.error("Error cargando detalles:", err));
    });

    // ---------------------------
    // Eliminar Rutina
    // ---------------------------
    btnEliminar.addEventListener("click", () => {
        const id = selectRutina.value;
        
        if (id === "Selecciona una Rutina") return;

        fetch("/api/rutina", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ id_rutina: id })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                alert("Rutina eliminada");
                cargarRutinas();
                tablaBody.innerHTML = "";
                // Cerrar modal si usas bootstrap manual, o dejar que el data-bs-dismiss lo haga
            }
        })
        .catch(err => console.error("Error eliminando rutina:", err));
    });

    // ---------------------------
    // Imprimir PDF
    // ---------------------------
    btnImprimir.addEventListener("click", () => {
        // 1. Validar que haya una rutina seleccionada
        if (selectRutina.value === "Selecciona una Rutina") {
            alert("Por favor, selecciona una rutina para imprimir.");
            return;
        }

        // 2. Seleccionar el elemento base
        const elementoParaImprimir = document.querySelector(".table-responsive");
        
        // Validar que la tabla tenga contenido
        if (!elementoParaImprimir) {
            alert("No se encontró la tabla para imprimir.");
            return;
        }

        // 3. Obtener el nombre
        const nombreRutina = selectRutina.options[selectRutina.selectedIndex].text.trim();
        
        // 4. Configuración del PDF
        const opciones = {
            margin:       0.5, // Ajustado a 0.5 pulgadas para aprovechar mejor la hoja
            filename:     `Rutina_${nombreRutina}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Clonamos el elemento para el PDF
        const contenidoClonado = elementoParaImprimir.cloneNode(true);
        
        // Creamos un título personalizado
        const titulo = document.createElement("h2");
        titulo.innerText = nombreRutina;
        titulo.style.textAlign = "center";
        titulo.style.marginBottom = "20px";
        titulo.style.fontFamily = "sans-serif";

        // Creamos un contenedor temporal
        const contenedorPDF = document.createElement("div");
        contenedorPDF.appendChild(titulo);
        contenedorPDF.appendChild(contenidoClonado);

        // 5. Generar PDF usando el contenedor temporal
        html2pdf()
            .set(opciones)
            .from(contenedorPDF) // <--- CORRECCIÓN IMPORTANTE: Usamos el contenedor con título
            .save();
    });

    // Inicializar al cargar la página
    cargarRutinas();
});