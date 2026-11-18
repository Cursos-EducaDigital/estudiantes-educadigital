import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDocs, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

// Configuración del proyecto Firebase Educa Digital.
const firebaseConfig = {
  apiKey: "AIzaSyAC6wVTMUyH5O7pR7NrtG1-i-MyQgOSB1g",
  authDomain: "educadigital-f1393.firebaseapp.com",
  projectId: "educadigital-f1393",
  storageBucket: "educadigital-f1393.firebasestorage.app",
  messagingSenderId: "309526687498",
  appId: "1:309526687498:web:271c34d0c858cc48d494f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const graduadosRef = collection(db, "graduados");
const contadorRef = doc(db, "configuracion", "contadorGraduados");
const ADMIN_PASSWORD = "EducaDigital@1409";
const PAGE_SIZE = 15;
let registros = [];
let pagina = 1;
let unsubscribe = null;

const normalizar = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const escapar = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const fechaVisible = value => {
  if (!value) return "—";
  const parts = String(value).split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
};
const codigoNumero = codigo => Number(String(codigo || "").replace(/^ED-/, "")) || 0;
const siguienteCodigo = numero => `ED-${String(numero).padStart(6, "0")}`;

function iniciarEscucha() {
  if (unsubscribe) return;
  unsubscribe = onSnapshot(graduadosRef, snapshot => {
    registros = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
      .sort((a,b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0) || codigoNumero(b.codigo) - codigoNumero(a.codigo));
    renderPublico();
    renderAdmin();
    actualizarCodigoSiguiente();
  }, error => {
    console.error("Error leyendo Firestore:", error);
    const status = document.getElementById("estado-listado");
    if (status) status.textContent = "No se pudo conectar con Firestore. Revisa las reglas de la base de datos.";
    const adminTable = document.getElementById("tabla-admin");
    if (adminTable) adminTable.innerHTML = '<tr><td colspan="5" class="empty">No se pudo leer Firestore. Revisa las reglas de acceso.</td></tr>';
  });
}

function renderPublico() {
  const body = document.getElementById("lista-graduados");
  if (!body) return;
  const filtro = normalizar(document.getElementById("filtro-codigo")?.value || "");
  const filtrados = registros.filter(item => normalizar(item.codigo).includes(filtro));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  pagina = Math.min(pagina, totalPaginas);
  const inicio = (pagina - 1) * PAGE_SIZE;
  const visibles = filtrados.slice(inicio, inicio + PAGE_SIZE);
  body.innerHTML = visibles.length ? visibles.map(item => `<tr><td>${escapar(item.codigo)}</td><td>${escapar(item.apellido)}</td><td>${escapar(item.nombre)}</td><td>${escapar(fechaVisible(item.fecha))}</td></tr>`).join("") : '<tr><td class="empty" colspan="4">No se encontraron graduados.</td></tr>';
  const info = document.getElementById("pagina-info");
  if (info) info.textContent = `Página ${pagina} de ${totalPaginas}`;
  const anterior = document.getElementById("pagina-anterior");
  const siguiente = document.getElementById("pagina-siguiente");
  if (anterior) anterior.disabled = pagina <= 1;
  if (siguiente) siguiente.disabled = pagina >= totalPaginas;
  const status = document.getElementById("estado-listado");
  if (status) status.textContent = `${filtrados.length} graduado${filtrados.length === 1 ? "" : "s"} encontrado${filtrados.length === 1 ? "" : "s"}.`;
}

function renderAdmin() {
  const body = document.getElementById("tabla-admin");
  if (!body) return;
  const total = document.getElementById("total-graduados");
  if (total) total.textContent = `${registros.length} registro${registros.length === 1 ? "" : "s"}`;
  if (!registros.length) {
    body.innerHTML = '<tr><td colspan="5" class="empty">Todavía no hay graduados cargados.</td></tr>';
    return;
  }
  body.innerHTML = registros.map(item => `<tr>
    <td>${escapar(item.codigo)}</td><td>${escapar(item.apellido)}</td><td>${escapar(item.nombre)}</td><td>${escapar(fechaVisible(item.fecha))}</td>
    <td><div class="actions"><button class="action-btn" type="button" data-edit="${escapar(item.id)}">Editar</button><button class="action-btn delete" type="button" data-delete="${escapar(item.id)}">Borrar</button></div></td>
  </tr>`).join("");
}

function actualizarCodigoSiguiente() {
  const target = document.getElementById("codigo-siguiente");
  if (!target) return;
  const mayor = registros.reduce((max, item) => Math.max(max, codigoNumero(item.codigo)), 0);
  target.textContent = `Próximo código: ${siguienteCodigo(mayor + 1)}`;
}

function iniciarListadoPublico() {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("filtro-codigo").addEventListener("input", () => { pagina = 1; renderPublico(); });
  document.getElementById("pagina-anterior").addEventListener("click", () => { pagina--; renderPublico(); });
  document.getElementById("pagina-siguiente").addEventListener("click", () => { pagina++; renderPublico(); });
  iniciarEscucha();
}

function iniciarAccesoAdmin() {
  const modal = document.getElementById("modal-acceso");
  const formAcceso = document.getElementById("form-acceso");
  const input = document.getElementById("contrasena");
  const error = document.getElementById("error-acceso");
  const desbloqueado = sessionStorage.getItem("ed_admin_ok") === "1";
  if (desbloqueado) { modal.hidden = true; iniciarPanelAdmin(); }
  formAcceso.addEventListener("submit", event => {
    event.preventDefault();
    if (input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem("ed_admin_ok", "1");
      modal.hidden = true;
      error.textContent = "";
      iniciarPanelAdmin();
    } else {
      error.textContent = "La contraseña no es correcta.";
      input.value = "";
      input.focus();
    }
  });
}

function iniciarPanelAdmin() {
  if (document.body.dataset.adminStarted === "1") return;
  document.body.dataset.adminStarted = "1";
  iniciarEscucha();
  const form = document.getElementById("form-graduado");
  const mensaje = document.getElementById("mensaje-form");
  const guardar = document.getElementById("guardar-btn");
  const cancelar = document.getElementById("cancelar-edicion");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const id = document.getElementById("id-edicion").value;
    const apellido = document.getElementById("apellido").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const fecha = document.getElementById("fecha").value;
    if (!apellido || !nombre || !fecha) return;
    guardar.disabled = true;
    mensaje.classList.remove("error");
    mensaje.textContent = id ? "Guardando cambios…" : "Guardando graduado…";
    try {
      if (id) {
        await updateDoc(doc(db, "graduados", id), { apellido, nombre, fecha, actualizadoEn: serverTimestamp() });
        mensaje.textContent = "Los cambios se guardaron correctamente.";
      } else {
        // El contador y el alta se actualizan en una transacción para evitar repetir códigos.
        await runTransaction(db, async transaction => {
          const contadorSnap = await transaction.get(contadorRef);
          const todos = await getDocs(graduadosRef);
          const mayorExistente = todos.docs.reduce((max, item) => Math.max(max, codigoNumero(item.data().codigo)), 0);
          const ultimo = Math.max(Number(contadorSnap.data()?.ultimoNumero || 0), mayorExistente);
          const numero = ultimo + 1;
          const codigo = siguienteCodigo(numero);
          const nuevoRef = doc(graduadosRef, codigo);
          transaction.set(nuevoRef, { codigo, apellido, nombre, fecha, creadoEn: serverTimestamp() });
          transaction.set(contadorRef, { ultimoNumero: numero }, { merge: true });
        });
        mensaje.textContent = "Graduado cargado correctamente.";
      }
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      mensaje.classList.add("error");
      mensaje.textContent = traducirError(err);
    } finally { guardar.disabled = false; }
  });

  cancelar.addEventListener("click", limpiarFormulario);
  document.getElementById("tabla-admin").addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton) {
      const item = registros.find(record => record.id === editButton.dataset.edit);
      if (!item) return;
      document.getElementById("id-edicion").value = item.id;
      document.getElementById("apellido").value = item.apellido || "";
      document.getElementById("nombre").value = item.nombre || "";
      document.getElementById("fecha").value = item.fecha || "";
      document.getElementById("titulo-formulario").textContent = `Editar ${item.codigo}`;
      document.getElementById("guardar-btn").textContent = "Guardar cambios";
      cancelar.hidden = false;
      mensaje.textContent = "Editando el registro seleccionado.";
      document.getElementById("panel-formulario").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (deleteButton) {
      const item = registros.find(record => record.id === deleteButton.dataset.delete);
      if (!item || !confirm(`¿Seguro que deseas borrar a ${item.nombre} ${item.apellido} (${item.codigo})?`)) return;
      try {
        await deleteDoc(doc(db, "graduados", item.id));
        mensaje.classList.remove("error");
        mensaje.textContent = `${item.codigo} se eliminó correctamente.`;
        if (document.getElementById("id-edicion").value === item.id) limpiarFormulario();
      } catch (err) {
        console.error(err);
        mensaje.classList.add("error");
        mensaje.textContent = traducirError(err);
      }
    }
  });

  function limpiarFormulario() {
    form.reset();
    document.getElementById("id-edicion").value = "";
    document.getElementById("titulo-formulario").textContent = "Cargar graduado";
    guardar.textContent = "Guardar graduado";
    cancelar.hidden = true;
    actualizarCodigoSiguiente();
  }
}

function traducirError(error) {
  if (error?.code === "permission-denied") return "Firestore rechazó la operación. Revisa las reglas de la base de datos.";
  if (error?.code === "unavailable") return "No hay conexión con Firebase. Inténtalo nuevamente.";
  return "No se pudo completar la operación. Revisa la conexión con Firestore e inténtalo otra vez.";
}

if (document.getElementById("lista-graduados")) iniciarListadoPublico();
if (document.getElementById("modal-acceso")) iniciarAccesoAdmin();
