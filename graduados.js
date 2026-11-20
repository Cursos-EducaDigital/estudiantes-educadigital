
/* =========================================================
   EDUCA DIGITAL — LISTADO PÚBLICO DE GRADUADOS
   Fuente de datos: Firebase Cloud Firestore
   ========================================================= */

import { db } from "./firebase.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const REGISTROS_POR_PAGINA = 15;
const COLECCION_GRADUADOS = "graduados";

const elementos = {
  lista: document.getElementById("graduados-lista"),
  buscador: document.getElementById("buscar-graduado"),
  limpiar: document.getElementById("limpiar-busqueda"),
  total: document.getElementById("total-graduados"),
  estado: document.getElementById("estado-firebase"),
  paginaInfo: document.getElementById("pagina-info"),
  paginaActual: document.getElementById("pagina-actual"),
  anterior: document.getElementById("pagina-anterior"),
  siguiente: document.getElementById("pagina-siguiente"),
  anio: document.getElementById("year")
};

let graduados = [];
let paginaActual = 1;
let terminoBusqueda = "";

function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

// Convierte la fecha de graduación AAAA-MM-DD a un valor ordenable.
function fechaDesdeRegistro(registro) {
  const fecha = String(registro.fecha || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return 0;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia, 12).getTime();
}

// Obtiene la fecha de creación del documento en Firestore.
function fechaDeCreacion(registro) {
  const fecha = registro.creadoEn;

  if (!fecha) return 0;

  // Firestore Timestamp
  if (typeof fecha.toMillis === "function") {
    return fecha.toMillis();
  }

  if (typeof fecha.seconds === "number") {
    return fecha.seconds * 1000;
  }

  // Fecha JavaScript
  if (fecha instanceof Date) {
    return fecha.getTime();
  }

  // Otros formatos de fecha
  if (typeof fecha === "number") {
    return fecha;
  }

  const valor = Date.parse(fecha);
  return Number.isNaN(valor) ? 0 : valor;
}

// Muestra la fecha como DD/MM/AAAA.
function fechaVisible(fecha) {
  if (!fecha) return "—";

  const coincidencia = String(fecha).trim().match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!coincidencia) return String(fecha);

  return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
}

// Los últimos graduados cargados aparecen primero.
function ordenarGraduados(registros) {
  return [...registros].sort((a, b) => {
    const diferenciaCreacion =
      fechaDeCreacion(b) - fechaDeCreacion(a);

    if (diferenciaCreacion !== 0) {
      return diferenciaCreacion;
    }

    // Si tienen la misma fecha de creación, compara
    // las fechas de graduación.
    const diferenciaGraduacion =
      fechaDesdeRegistro(b) - fechaDesdeRegistro(a);

    if (diferenciaGraduacion !== 0) {
      return diferenciaGraduacion;
    }

    // Último criterio: código descendente.
    return String(b.codigo || "").localeCompare(
      String(a.codigo || ""),
      "es",
      { numeric: true }
    );
  });
}

function obtenerFiltrados() {
  const registrosOrdenados = ordenarGraduados(graduados);

  if (!terminoBusqueda) {
    return registrosOrdenados;
  }

  const termino = normalizarTexto(terminoBusqueda);

  return registrosOrdenados.filter(registro =>
    [
      registro.codigo,
      registro.apellido,
      registro.nombre
    ].some(valor => normalizarTexto(valor).includes(termino))
  );
}

function mostrarEstado(mensaje, tipo = "") {
  if (!elementos.estado) return;

  elementos.estado.textContent = mensaje;
  elementos.estado.dataset.estado = tipo;
}

function mostrar() {
  const resultados = obtenerFiltrados();

  const totalPaginas = Math.max(
    1,
    Math.ceil(resultados.length / REGISTROS_POR_PAGINA)
  );

  paginaActual = Math.min(
    Math.max(1, paginaActual),
    totalPaginas
  );

  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;

  const pagina = resultados.slice(
    inicio,
    inicio + REGISTROS_POR_PAGINA
  );

  elementos.lista.replaceChildren();

  if (pagina.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 4;
    celda.className = "graduados-empty";

    celda.textContent = terminoBusqueda
      ? "No se encontraron graduados que coincidan con tu búsqueda."
      : "Todavía no hay graduados registrados.";

    fila.appendChild(celda);
    elementos.lista.appendChild(fila);

  } else {
    pagina.forEach(registro => {
      const fila = document.createElement("tr");

      const valores = [
        registro.codigo,
        registro.apellido,
        registro.nombre,
        fechaVisible(registro.fecha)
      ];

      valores.forEach(valor => {
        const celda = document.createElement("td");
        celda.textContent = valor || "—";
        fila.appendChild(celda);
      });

      elementos.lista.appendChild(fila);
    });
  }

  elementos.total.textContent = terminoBusqueda
    ? `${resultados.length} resultado(s) de ${graduados.length} graduado(s)`
    : `${graduados.length} graduado(s) registrado(s)`;

  elementos.paginaInfo.textContent =
    `Página ${paginaActual} de ${totalPaginas}`;

  elementos.paginaActual.textContent = String(paginaActual);

  elementos.anterior.disabled = paginaActual === 1;
  elementos.siguiente.disabled = paginaActual >= totalPaginas;

  if (elementos.limpiar) {
    elementos.limpiar.disabled = terminoBusqueda.length === 0;
  }
}

function iniciarFirebase() {
  const referenciaColeccion = collection(
    db,
    COLECCION_GRADUADOS
  );

  mostrarEstado("Conectando con Firebase…");

  onSnapshot(
    referenciaColeccion,

    snapshot => {
      graduados = snapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
      }));

      paginaActual = 1;
      mostrar();

      mostrarEstado(
        "Listado actualizado desde Firebase.",
        "ok"
      );
    },

    error => {
      console.error(
        "Error al leer graduados de Firestore:",
        error
      );

      mostrarEstado(
        "No se pudo conectar con la base de datos. Intenta nuevamente más tarde.",
        "error"
      );
    }
  );
}

function iniciarPagina() {
  if (
    !elementos.lista ||
    !elementos.buscador ||
    !elementos.limpiar ||
    !elementos.total ||
    !elementos.paginaInfo ||
    !elementos.paginaActual ||
    !elementos.anterior ||
    !elementos.siguiente
  ) {
    console.error(
      "No se encontraron todos los elementos necesarios en graduados.html."
    );
    return;
  }

  if (elementos.anio) {
    elementos.anio.textContent = String(
      new Date().getFullYear()
    );
  }

  elementos.buscador.addEventListener("input", () => {
    terminoBusqueda = elementos.buscador.value.slice(0, 10);

    if (elementos.buscador.value !== terminoBusqueda) {
      elementos.buscador.value = terminoBusqueda;
    }

    paginaActual = 1;
    mostrar();
  });

  elementos.limpiar.addEventListener("click", () => {
    elementos.buscador.value = "";
    terminoBusqueda = "";
    paginaActual = 1;

    mostrar();
    elementos.buscador.focus();
  });

  elementos.anterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      mostrar();
    }
  });

  elementos.siguiente.addEventListener("click", () => {
    const totalPaginas = Math.ceil(
      obtenerFiltrados().length / REGISTROS_POR_PAGINA
    );

    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrar();
    }
  });

  mostrar();
  iniciarFirebase();
}

iniciarPagina();
