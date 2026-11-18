
/* =========================================
   EDUCA DIGITAL - LISTADO DE GRADUADOS
   ========================================= */

/*
  AGREGA LOS GRADUADOS MANUALMENTE EN ESTA LISTA.

  IMPORTANTE:
  - Coloca los más recientes al principio.
  - Los más antiguos deben quedar debajo.
  - Respeta las comillas y las comas.
  - No es necesario modificar ninguna otra parte
    del código para agregar nuevos registros.
*/

const graduados = [
    /*
    Ejemplo de estructura (reemplaza estos datos):

    {
        codigo: "ED-2026-001",
        apellido: "García",
        nombre: "María",
        expedicion: "Noviembre 2026"
    },

    {
        codigo: "ED-2026-002",
        apellido: "López",
        nombre: "Carlos",
        expedicion: "Octubre 2026"
    }
    */
];


/* =========================================
   CONFIGURACIÓN
   ========================================= */

const REGISTROS_POR_PAGINA = 15;

let paginaActual = 1;
let terminoBusqueda = "";


/* =========================================
   ELEMENTOS HTML
   ========================================= */

const listaGraduados = document.getElementById("graduados-lista");
const buscador = document.getElementById("buscar-graduado");
const botonLimpiar = document.getElementById("limpiar-busqueda");

const totalGraduados = document.getElementById("total-graduados");
const paginaInfo = document.getElementById("pagina-info");
const paginaActualTexto = document.getElementById("pagina-actual");

const botonAnterior = document.getElementById("pagina-anterior");
const botonSiguiente = document.getElementById("pagina-siguiente");


/* =========================================
   BÚSQUEDA
   ========================================= */

function obtenerGraduadosFiltrados() {

    if (!terminoBusqueda) {
        return graduados;
    }

    const busqueda = terminoBusqueda.toLocaleLowerCase();

    return graduados.filter(graduado => {

        const codigo = String(graduado.codigo || "").toLocaleLowerCase();
        const apellido = String(graduado.apellido || "").toLocaleLowerCase();
        const nombre = String(graduado.nombre || "").toLocaleLowerCase();

        return (
            codigo.includes(busqueda) ||
            apellido.includes(busqueda) ||
            nombre.includes(busqueda)
        );
    });
}


/* =========================================
   MOSTRAR TABLA
   ========================================= */

function mostrarGraduados() {

    const resultados = obtenerGraduadosFiltrados();

    const totalResultados = resultados.length;

    const totalPaginas = Math.max(
        1,
        Math.ceil(totalResultados / REGISTROS_POR_PAGINA)
    );

    // Evita permanecer en una página que ya no existe
    paginaActual = Math.min(paginaActual, totalPaginas);

    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;

    const graduadosPagina = resultados.slice(
        inicio,
        inicio + REGISTROS_POR_PAGINA
    );

    // Limpiar contenido anterior
    listaGraduados.replaceChildren();


    // Mostrar resultados
    if (graduadosPagina.length === 0) {

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 4;

        celda.className = "graduados-empty";

        celda.textContent = terminoBusqueda
            ? "No se encontraron graduados que coincidan con tu búsqueda."
            : "Todavía no hay graduados registrados.";

        fila.appendChild(celda);
        listaGraduados.appendChild(fila);

    } else {

        graduadosPagina.forEach(graduado => {

            const fila = document.createElement("tr");

            const valores = [
                graduado.codigo,
                graduado.apellido,
                graduado.nombre,
                graduado.expedicion
            ];

            valores.forEach(valor => {

                const celda = document.createElement("td");

                // textContent evita interpretar datos como HTML
                celda.textContent = valor || "—";

                fila.appendChild(celda);
            });

            listaGraduados.appendChild(fila);
        });
    }


    // Información de registros
    if (terminoBusqueda) {

        totalGraduados.textContent =
            `${totalResultados} resultado(s) de ${graduados.length} graduado(s)`;

    } else {

        totalGraduados.textContent =
            `${graduados.length} graduado(s) registrado(s)`;
    }


    // Información de páginas
    paginaInfo.textContent =
        `Página ${paginaActual} de ${totalPaginas}`;

    paginaActualTexto.textContent = paginaActual;


    // Estado de las flechas
    botonAnterior.disabled = paginaActual === 1;

    botonSiguiente.disabled = paginaActual >= totalPaginas;


    // Estado del botón limpiar
    botonLimpiar.disabled = terminoBusqueda.length === 0;
}


/* =========================================
   EVENTOS DEL BUSCADOR
   ========================================= */

buscador.addEventListener("input", () => {

    // Máximo de 10 caracteres
    terminoBusqueda = buscador.value.slice(0, 10);

    paginaActual = 1;

    mostrarGraduados();
});


/* =========================================
   LIMPIAR BÚSQUEDA
   ========================================= */

botonLimpiar.addEventListener("click", () => {

    buscador.value = "";

    terminoBusqueda = "";

    paginaActual = 1;

    mostrarGraduados();

    buscador.focus();
});


/* =========================================
   NAVEGACIÓN ENTRE PÁGINAS
   ========================================= */

botonAnterior.addEventListener("click", () => {

    if (paginaActual > 1) {

        paginaActual--;

        mostrarGraduados();
    }
});


botonSiguiente.addEventListener("click", () => {

    const resultados = obtenerGraduadosFiltrados();

    const totalPaginas = Math.ceil(
        resultados.length / REGISTROS_POR_PAGINA
    );

    if (paginaActual < totalPaginas) {

        paginaActual++;

        mostrarGraduados();
    }
});


/* =========================================
   AÑO AUTOMÁTICO DEL PIE DE PÁGINA
   ========================================= */

const elementoAnio = document.getElementById("year");

if (elementoAnio) {
    elementoAnio.textContent = new Date().getFullYear();
}


/* =========================================
   INICIAR LISTADO
   ========================================= */

mostrarGraduados();
