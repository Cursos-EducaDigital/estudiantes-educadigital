/* =========================================================
   EDUCA DIGITAL — LISTADO PÚBLICO DE GRADUADOS
   Fuente de datos: Firebase Cloud Firestore
   ========================================================= */

import { db } from "./firebase.js";
import {
  collection,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const REGISTROS_POR_PAGINA = 15;
const COLECCION_GRADUADOS = "graduados";
const DOCUMENTO_CONFIGURACION = ["configuracion", "graduados"];

// Respaldo temporal de los 16 registros que ya estaban publicados.
// Se muestran hasta que carga.html complete la migración inicial a Firestore.
// No se escriben automáticamente desde esta página pública.
const GRADUADOS_INICIALES = [];

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

let graduados = [...GRADUADOS_INICIALES];
let migracionCompletada = false;
let documentosFirestore = [];
let paginaActual = 1;
let terminoBusqueda = "";
let huboErrorFirestore = false;

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

  const coincidencia = String(registro.expedicion || "")
    .trim()
    .match(/^([a-záéíóúñ]+)\s+(\d{4})$/i);

  if (!coincidencia) return 0;

  const mes = normalizarTexto(coincidencia[1]);
  const anio = Number(coincidencia[2]);
  if (!(mes in meses) || !anio) return 0;

  return new Date(anio, meses[mes], 1, 12).getTime();
}

function ordenarGraduados(registros) {
  return [...registros].sort((a, b) => {
    const diferencia = fechaDesdeRegistro(b) - fechaDesdeRegistro(a);
    return diferencia || String(a.codigo).localeCompare(String(b.codigo), "es");
  });
}

function obtenerFiltrados() {
  const registrosOrdenados = ordenarGraduados(graduados);
  if (!terminoBusqueda) return registrosOrdenados;

  const termino = normalizarTexto(terminoBusqueda);
  return registrosOrdenados.filter(registro =>
    [registro.codigo, registro.apellido, registro.nombre]
      .some(valor => normalizarTexto(valor).includes(termino))
  );
}

function mostrarEstado(mensaje, tipo = "") {
  if (!elementos.estado) return;
  elementos.estado.textContent = mensaje;
  elementos.estado.dataset.estado = tipo;
}

function mostrar() {
  const resultados = obtenerFiltrados();
  const totalPaginas = Math.max(1, Math.ceil(resultados.length / REGISTROS_POR_PAGINA));
  paginaActual = Math.min(paginaActual, totalPaginas);

  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const pagina = resultados.slice(inicio, inicio + REGISTROS_POR_PAGINA);

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
      [registro.codigo, registro.apellido, registro.nombre, registro.expedicion]
        .forEach(valor => {
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

  elementos.paginaInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  elementos.paginaActual.textContent = String(paginaActual);
  elementos.anterior.disabled = paginaActual === 1;
  elementos.siguiente.disabled = paginaActual >= totalPaginas;
  elementos.limpiar.disabled = terminoBusqueda.length === 0;
}

function combinarConRespaldo() {
  if (migracionCompletada) {
    graduados = documentosFirestore;
    return;
  }

  // Mientras no se confirme la migración, conserva todos los registros locales
  // y agrega los documentos nuevos sin duplicar códigos.
  const porCodigo = new Map(
    GRADUADOS_INICIALES.map(registro => [normalizarTexto(registro.codigo), registro])
  );

  documentosFirestore.forEach(registro => {
    porCodigo.set(normalizarTexto(registro.codigo), registro);
  });

  graduados = [...porCodigo.values()];
}

function iniciarFirebase() {
  const referenciaColeccion = collection(db, COLECCION_GRADUADOS);
  const referenciaConfiguracion = doc(db, ...DOCUMENTO_CONFIGURACION);

  onSnapshot(referenciaConfiguracion, (snapshot) => {
    migracionCompletada = snapshot.exists() &&
      snapshot.data().migracionInicialCompletada === true;
    combinarConRespaldo();
    mostrar();

    if (migracionCompletada) {
      mostrarEstado("Listado actualizado desde Firebase.", "ok");
    } else {
      mostrarEstado("Mostrando el registro actual. La conexión con Firebase está preparada; la migración inicial se completará desde el panel administrativo.");
    }
  }, (error) => {
    console.error("Error al consultar la configuración de Firebase:", error);
    huboErrorFirestore = true;
    mostrarEstado("No se pudo verificar la configuración de Firebase. Se conserva el listado anterior.", "error");
  });

  onSnapshot(referenciaColeccion, (snapshot) => {
    documentosFirestore = snapshot.docs.map(documento => ({
      id: documento.id,
      ...documento.data()
    }));

    combinarConRespaldo();
    mostrar();
  }, (error) => {
    console.error("Error al leer graduados de Firestore:", error);
    huboErrorFirestore = true;
    mostrarEstado("No se pudo conectar con la base de datos. Se muestran los registros anteriores.", "error");
    // No vaciar la tabla ni eliminar los 16 registros si Firestore aún no está configurado.
    if (!migracionCompletada) {
      graduados = [...GRADUADOS_INICIALES];
      mostrar();
    }
  });
}

function iniciarPagina() {
  if (!elementos.lista || !elementos.buscador || !elementos.limpiar ||
      !elementos.total || !elementos.paginaInfo || !elementos.paginaActual ||
      !elementos.anterior || !elementos.siguiente) {
    console.error("No se encontraron todos los elementos necesarios en graduados.html.");
    return;
  }

  if (elementos.anio) {
    elementos.anio.textContent = String(new Date().getFullYear());
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
    const totalPaginas = Math.ceil(obtenerFiltrados().length / REGISTROS_POR_PAGINA);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrar();
    }
  });

  mostrar();
  iniciarFirebase();
}

iniciarPagina();
