/* =========================================================
   EDUCA DIGITAL - LISTADO Y ADMINISTRACIÓN DE GRADUADOS
   Este mismo archivo funciona en graduados.html y carga.html.
   ========================================================= */

/* === INICIO DATOS === */
const graduados = [
    { codigo: "ED-00001", apellido: "Smith", nombre: "Michael", expedicion: "Noviembre 2026" },
    { codigo: "ED-00002", apellido: "Miller", nombre: "Jessica", expedicion: "Noviembre 2026" },
    { codigo: "ED-00003", apellido: "Johnson", nombre: "Emily", expedicion: "Noviembre 2026" },
    { codigo: "ED-00004", apellido: "Anderson", nombre: "Joshua", expedicion: "Noviembre 2026" },
    { codigo: "ED-00005", apellido: "Wilson", nombre: "Liam", expedicion: "Noviembre 2026" },
    { codigo: "ED-00006", apellido: "Taylor", nombre: "Matthew", expedicion: "Noviembre 2026" },
    { codigo: "ED-00007", apellido: "Davis", nombre: "Olivia", expedicion: "Noviembre 2026" },
    { codigo: "ED-00008", apellido: "Brown", nombre: "Madison", expedicion: "Noviembre 2026" },
    { codigo: "ED-00009", apellido: "Jones", nombre: "Christopher", expedicion: "Noviembre 2026" },
    { codigo: "ED-00010", apellido: "Williams", nombre: "Ashley", expedicion: "Noviembre 2026" },
    { codigo: "ED-00011", apellido: "Mendoza", nombre: "Valeria", expedicion: "Noviembre 2026" },
    { codigo: "ED-00012", apellido: "Navarro", nombre: "Camila", expedicion: "Noviembre 2026" },
    { codigo: "ED-00013", apellido: "Cárdenas", nombre: "Mateo", expedicion: "Noviembre 2026" },
    { codigo: "ED-00014", apellido: "Benítez", nombre: "Emilio", expedicion: "Noviembre 2026" },
    { codigo: "ED-00015", apellido: "Solís", nombre: "Andrés", expedicion: "Noviembre 2026" },
    { codigo: "ED-00016", apellido: "Clark", nombre: "Brandon", expedicion: "Noviembre 2026" }
];
/* === FIN DATOS === */

/* =========================================================
   UTILIDADES COMPARTIDAS
   ========================================================= */

const REGISTROS_POR_PAGINA = 15;

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es");
}

function fechaDesdeRegistro(registro) {
    if (registro.fechaISO && /^\d{4}-\d{2}-\d{2}$/.test(registro.fechaISO)) {
        return new Date(`${registro.fechaISO}T12:00:00`).getTime();
    }

    const meses = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
        julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    const coincidencia = String(registro.expedicion || "").trim()
        .match(/^([a-záéíóúñ]+)\s+(\d{4})$/i);

    if (!coincidencia) return 0;

    const mes = normalizarTexto(coincidencia[1]);
    const anio = Number(coincidencia[2]);

    if (!(mes in meses) || !anio) return 0;
    return new Date(anio, meses[mes], 1, 12).getTime();
}

function ordenarGraduados(registros) {
    return [...registros].sort((a, b) => fechaDesdeRegistro(b) - fechaDesdeRegistro(a));
}

function formatearExpedicion(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia, 12);
    const texto = new Intl.DateTimeFormat("es", {
        month: "long",
        year: "numeric"
    }).format(fecha);

    return texto.charAt(0).toLocaleUpperCase("es") + texto.slice(1);
}

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caracter]);
}


/* =========================================================
   LISTADO PÚBLICO — graduados.html
   ========================================================= */

function iniciarListadoPublico() {
    const lista = document.getElementById("graduados-lista");
    const buscador = document.getElementById("buscar-graduado");
    const botonLimpiar = document.getElementById("limpiar-busqueda");
    const totalTexto = document.getElementById("total-graduados");
    const paginaInfo = document.getElementById("pagina-info");
    const paginaActualTexto = document.getElementById("pagina-actual");
    const botonAnterior = document.getElementById("pagina-anterior");
    const botonSiguiente = document.getElementById("pagina-siguiente");

    if (!lista || !buscador || !botonLimpiar || !totalTexto ||
        !paginaInfo || !paginaActualTexto || !botonAnterior || !botonSiguiente) {
        return;
    }

    let paginaActual = 1;
    let terminoBusqueda = "";

    function obtenerFiltrados() {
        if (!terminoBusqueda) return ordenarGraduados(graduados);

        const termino = normalizarTexto(terminoBusqueda);
        return ordenarGraduados(graduados).filter(registro =>
            [registro.codigo, registro.apellido, registro.nombre]
                .some(valor => normalizarTexto(valor).includes(termino))
        );
    }

    function mostrar() {
        const resultados = obtenerFiltrados();
        const totalPaginas = Math.max(1, Math.ceil(resultados.length / REGISTROS_POR_PAGINA));
        paginaActual = Math.min(paginaActual, totalPaginas);

        const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
        const pagina = resultados.slice(inicio, inicio + REGISTROS_POR_PAGINA);
        lista.replaceChildren();

        if (pagina.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 4;
            celda.className = "graduados-empty";
            celda.textContent = terminoBusqueda
                ? "No se encontraron graduados que coincidan con tu búsqueda."
                : "Todavía no hay graduados registrados.";
            fila.appendChild(celda);
            lista.appendChild(fila);
        } else {
            pagina.forEach(registro => {
                const fila = document.createElement("tr");
                [registro.codigo, registro.apellido, registro.nombre, registro.expedicion]
                    .forEach(valor => {
                        const celda = document.createElement("td");
                        celda.textContent = valor || "—";
                        fila.appendChild(celda);
                    });
                lista.appendChild(fila);
            });
        }

        totalTexto.textContent = terminoBusqueda
            ? `${resultados.length} resultado(s) de ${graduados.length} graduado(s)`
            : `${graduados.length} graduado(s) registrado(s)`;

        paginaInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        paginaActualTexto.textContent = paginaActual;
        botonAnterior.disabled = paginaActual === 1;
        botonSiguiente.disabled = paginaActual >= totalPaginas;
        botonLimpiar.disabled = terminoBusqueda.length === 0;
    }

    buscador.addEventListener("input", () => {
        terminoBusqueda = buscador.value.slice(0, 10);
        if (buscador.value !== terminoBusqueda) buscador.value = terminoBusqueda;
        paginaActual = 1;
        mostrar();
    });

    botonLimpiar.addEventListener("click", () => {
        buscador.value = "";
        terminoBusqueda = "";
        paginaActual = 1;
        mostrar();
        buscador.focus();
    });

    botonAnterior.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrar();
        }
    });

    botonSiguiente.addEventListener("click", () => {
        const totalPaginas = Math.ceil(obtenerFiltrados().length / REGISTROS_POR_PAGINA);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrar();
        }
    });

    mostrar();
}


/* =========================================================
   ADMINISTRACIÓN — carga.html
   ========================================================= */

function iniciarAdministracion() {
    const formulario = document.getElementById("formulario-graduado");
    const lista = document.getElementById("lista-admin");
    const total = document.getElementById("total-graduados");
    const buscador = document.getElementById("buscar-admin");
    const botonCancelar = document.getElementById("cancelar-edicion");
    const botonDescargar = document.getElementById("descargar-datos");
    const estadoPublicacion = document.getElementById("estado-publicacion");

    if (!formulario || !lista || !total || !buscador || !botonDescargar) return;

    const campoCodigo = document.getElementById("codigo-graduado");
    const campoApellido = document.getElementById("apellido-graduado");
    const campoNombre = document.getElementById("nombre-graduado");
    const campoFecha = document.getElementById("fecha-graduado");
    const indiceEdicion = document.getElementById("indice-edicion");
    const tituloFormulario = document.getElementById("titulo-formulario");
    const botonGuardar = document.getElementById("guardar-graduado");

    // La lista inicial completa se conserva como referencia para detectar cambios externos.
    let codigosIniciales = graduados.map(registro => registro.codigo);
    let registros = graduados.map(registro => ({ ...registro }));

    function limpiarFormulario() {
        formulario.reset();
        indiceEdicion.value = "";
        tituloFormulario.textContent = "Añadir graduado";
        botonGuardar.textContent = "Guardar graduado";
        botonCancelar.hidden = true;
    }

    function actualizarEstado() {
        estadoPublicacion.textContent =
            "Cambios pendientes. Presione «Guardar y publicar cambios» para actualizar GitHub automáticamente.";
    }

    function renderizarTabla() {
        const termino = normalizarTexto(buscador.value.trim());
        const filtrados = ordenarGraduados(registros).filter(registro =>
            !termino || [registro.codigo, registro.apellido, registro.nombre]
                .some(valor => normalizarTexto(valor).includes(termino))
        );

        total.textContent = registros.length;
        lista.replaceChildren();

        if (filtrados.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 5;
            celda.className = "tabla-vacia";
            celda.textContent = termino
                ? "No hay registros que coincidan con la búsqueda."
                : "Todavía no hay graduados registrados.";
            fila.appendChild(celda);
            lista.appendChild(fila);
            return;
        }

        filtrados.forEach(registro => {
            const fila = document.createElement("tr");

            [registro.codigo, registro.apellido, registro.nombre, registro.expedicion]
                .forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor || "—";
                    fila.appendChild(celda);
                });

            const celdaAcciones = document.createElement("td");
            const acciones = document.createElement("div");
            acciones.className = "acciones-tabla";

            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.className = "boton-secundario";
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", () => editarRegistro(registro.codigo));

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "boton-secundario";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", () => eliminarRegistro(registro.codigo));

            acciones.append(botonEditar, botonEliminar);
            celdaAcciones.appendChild(acciones);
            fila.appendChild(celdaAcciones);
            lista.appendChild(fila);
        });
    }

    function editarRegistro(codigo) {
        const registro = registros.find(item => item.codigo === codigo);
        if (!registro) return;

        campoCodigo.value = registro.codigo;
        campoApellido.value = registro.apellido;
        campoNombre.value = registro.nombre;

        if (registro.fechaISO) {
            campoFecha.value = registro.fechaISO;
        } else {
            // Los registros antiguos solo guardaban mes y año, no el día exacto.
            // Se coloca el primer día del mes como valor editable provisional.
            const coincidencia = registro.expedicion.match(/^([a-záéíóúñ]+)\s+(\d{4})$/i);
            const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
            const mes = coincidencia ? meses.indexOf(normalizarTexto(coincidencia[1])) : -1;
            campoFecha.value = mes >= 0
                ? `${coincidencia[2]}-${String(mes + 1).padStart(2, "0")}-01`
                : "";
        }

        indiceEdicion.value = codigo;
        tituloFormulario.textContent = "Editar graduado";
        botonGuardar.textContent = "Guardar cambios";
        botonCancelar.hidden = false;
        formulario.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function eliminarRegistro(codigo) {
        const registro = registros.find(item => item.codigo === codigo);
        if (!registro) return;

        const confirmar = window.confirm(
            `¿Desea eliminar el registro de ${registro.nombre} ${registro.apellido} (${registro.codigo})?`
        );
        if (!confirmar) return;

        registros = registros.filter(item => item.codigo !== codigo);
        if (indiceEdicion.value === codigo) limpiarFormulario();
        renderizarTabla();
        actualizarEstado();
    }

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const codigo = campoCodigo.value.trim();
        const apellido = campoApellido.value.trim();
        const nombre = campoNombre.value.trim();
        const fechaISO = campoFecha.value;

        if (!codigo || !apellido || !nombre || !fechaISO) {
            alert("Complete todos los campos antes de guardar.");
            return;
        }

        const codigoExistente = registros.some(registro =>
            normalizarTexto(registro.codigo) === normalizarTexto(codigo) &&
            registro.codigo !== indiceEdicion.value
        );

        if (codigoExistente) {
            alert("Ese código ya está registrado. Cada graduado debe tener un código único.");
            campoCodigo.focus();
            return;
        }

        const nuevoRegistro = {
            codigo,
            apellido,
            nombre,
            expedicion: formatearExpedicion(fechaISO),
            fechaISO
        };

        if (indiceEdicion.value) {
            const posicion = registros.findIndex(item => item.codigo === indiceEdicion.value);
            if (posicion !== -1) registros[posicion] = nuevoRegistro;
        } else {
            registros.push(nuevoRegistro);
        }

        registros = ordenarGraduados(registros);
        limpiarFormulario();
        renderizarTabla();
        actualizarEstado();
    });

    botonCancelar.addEventListener("click", limpiarFormulario);
    buscador.addEventListener("input", renderizarTabla);

    botonDescargar.addEventListener("click", async () => {
        const listaCompleta = ordenarGraduados(registros);
        const confirmar = window.confirm(
            `Se publicarán ${listaCompleta.length} graduado(s) en el listado público. ¿Desea continuar?`
        );
        if (!confirmar) return;

        botonDescargar.disabled = true;
        const textoOriginal = botonDescargar.textContent;
        botonDescargar.textContent = "Guardando en GitHub...";

        try {
            const respuesta = await fetch("/api/guardar-graduados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                    action: "save",
                    records: listaCompleta,
                    originalCodes: codigosIniciales
                })
            });

            const resultado = await respuesta.json().catch(() => ({}));
            if (!respuesta.ok) {
                throw new Error(resultado.error || `Error del servidor (${respuesta.status}).`);
            }

            codigosIniciales = listaCompleta.map(registro => registro.codigo);
            estadoPublicacion.textContent =
                `¡Guardado correctamente! GitHub recibió los ${listaCompleta.length} registros. Vercel actualizará el listado público al completar el despliegue.`;
            alert("¡Cambios guardados en GitHub!\n\nEl listado público se actualizará automáticamente cuando Vercel termine el despliegue.");
        } catch (error) {
            console.error("Error al publicar graduados:", error);
            alert(
                "No se pudieron publicar los cambios.\n\n" +
                "Los datos siguen en esta pantalla; no cierre ni actualice la página.\n\n" +
                "Detalle: " + error.message
            );
            estadoPublicacion.textContent =
                "No se publicaron los cambios. Los registros siguen en esta sesión; puede volver a intentarlo.";
        } finally {
            botonDescargar.disabled = false;
            botonDescargar.textContent = textoOriginal;
        }
    });

    // El guardado se realiza directamente en GitHub mediante una función privada de Vercel.
    botonDescargar.disabled = false;
    total.textContent = registros.length;
    renderizarTabla();
    actualizarEstado();
}


/* =========================================================
   INICIALIZACIÓN SEGÚN LA PÁGINA
   ========================================================= */

const elementoAnio = document.getElementById("year");
if (elementoAnio) {
    elementoAnio.textContent = new Date().getFullYear();
}

if (document.getElementById("graduados-lista")) {
    iniciarListadoPublico();
}

if (document.getElementById("formulario-graduado")) {
    iniciarAdministracion();
}
