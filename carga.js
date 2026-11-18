/* =========================================================
   EDUCA DIGITAL — PANEL PRIVADO DE GRADUADOS
   Firebase Authentication + Cloud Firestore (SDK modular)
   ========================================================= */

import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

const COLLECTION = "graduados";
const CONFIG_DOC = doc(db, "configuracion", "graduados");

const INITIAL_GRADUATES = [
  { codigo: "ED-00001", apellido: "Smith", nombre: "Michael", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00002", apellido: "Miller", nombre: "Jessica", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00003", apellido: "Johnson", nombre: "Emily", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00004", apellido: "Anderson", nombre: "Joshua", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00005", apellido: "Wilson", nombre: "Liam", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00006", apellido: "Taylor", nombre: "Matthew", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00007", apellido: "Davis", nombre: "Olivia", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00008", apellido: "Brown", nombre: "Madison", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00009", apellido: "Jones", nombre: "Christopher", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00010", apellido: "Williams", nombre: "Ashley", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00011", apellido: "Mendoza", nombre: "Valeria", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00012", apellido: "Navarro", nombre: "Camila", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00013", apellido: "Cárdenas", nombre: "Mateo", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00014", apellido: "Benítez", nombre: "Emilio", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00015", apellido: "Solís", nombre: "Andrés", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" },
  { codigo: "ED-00016", apellido: "Clark", nombre: "Brandon", expedicion: "Noviembre 2026", fechaISO: "2026-11-01" }
];

const $ = (id) => document.getElementById(id);
const loginPanel = $("login-panel");
const adminPanel = $("admin-panel");
const loginForm = $("login-form");
const graduateForm = $("graduate-form");
const recordsBody = $("admin-records");

let records = [];
let stopListening = null;
let currentUser = null;

function setMessage(element, message, kind = "") {
  if (!element) return;
  element.textContent = message;
  element.dataset.kind = kind;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

function getDateFromMonthYear(value) {
  const months = {
    enero: "01", febrero: "02", marzo: "03", abril: "04",
    mayo: "05", junio: "06", julio: "07", agosto: "08",
    septiembre: "09", setiembre: "09", octubre: "10",
    noviembre: "11", diciembre: "12"
  };
  const match = String(value ?? "").trim().match(/^([a-záéíóúñ]+)\s+(\d{4})$/i);
  if (!match) return "";
  const month = months[normalize(match[1])];
  return month ? `${match[2]}-${month}-01` : "";
}

function showLogin() {
  loginPanel.hidden = false;
  adminPanel.hidden = true;
  if (stopListening) {
    stopListening();
    stopListening = null;
  }
}

function showAdmin() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  $("connection-state").textContent = "Conectando…";
  startRealtimeListener();
  checkInitialImport();
}

function startRealtimeListener() {
  if (stopListening) stopListening();

  stopListening = onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      records = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      records.sort((a, b) => {
        const dateDiff = String(b.fechaISO || "").localeCompare(String(a.fechaISO || ""));
        return dateDiff || String(a.codigo || "").localeCompare(String(b.codigo || ""));
      });
      $("total-registros").textContent = String(records.length);
      $("connection-state").textContent = "Conectado";
      $("connection-state").classList.add("connected");
      renderRecords();
    },
    (error) => {
      console.error("Firestore listener:", error);
      $("connection-state").textContent = "Error de permisos";
      $("connection-state").classList.remove("connected");
      setMessage($("global-message"), explainFirebaseError(error), "error");
    }
  );
}

function renderRecords() {
  const term = normalize($("filter-records").value);
  const filtered = records.filter(record =>
    [record.codigo, record.apellido, record.nombre]
      .some(value => normalize(value).includes(term))
  );

  recordsBody.replaceChildren();

  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-cell";
    cell.textContent = term ? "No hay coincidencias." : "Todavía no hay graduados registrados.";
    row.appendChild(cell);
    recordsBody.appendChild(row);
    return;
  }

  filtered.forEach(record => {
    const row = document.createElement("tr");

    const code = document.createElement("td");
    code.className = "code-cell";
    code.textContent = record.codigo || "—";

    const name = document.createElement("td");
    name.textContent = `${record.apellido || ""}, ${record.nombre || ""}`;

    const date = document.createElement("td");
    date.textContent = record.expedicion || "—";

    const actions = document.createElement("td");
    actions.className = "actions-cell";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "action-button edit";
    edit.textContent = "Editar";
    edit.addEventListener("click", () => beginEdit(record));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "action-button delete";
    remove.textContent = "Eliminar";
    remove.addEventListener("click", () => removeRecord(record));

    actions.append(edit, remove);
    row.append(code, name, date, actions);
    recordsBody.appendChild(row);
  });
}

function beginEdit(record) {
  $("record-id").value = record.id;
  $("codigo").value = record.codigo || "";
  $("apellido").value = record.apellido || "";
  $("nombre").value = record.nombre || "";
  $("expedicion").value = record.expedicion || "";
  $("form-title").textContent = "Editar graduado";
  $("save-button").textContent = "Guardar cambios";
  $("cancel-edit").hidden = false;
  $("edit-indicator").hidden = false;
  setMessage($("form-message"), "Modifica los datos y guarda los cambios.");
  $("codigo").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  graduateForm.reset();
  $("record-id").value = "";
  $("form-title").textContent = "Agregar graduado";
  $("save-button").textContent = "Guardar graduado";
  $("cancel-edit").hidden = true;
  $("edit-indicator").hidden = true;
  setMessage($("form-message"), "");
}

async function ensureUniqueCode(code, currentId = "") {
  const q = query(collection(db, COLLECTION), where("codigo", "==", code));
  const snapshot = await getDocs(q);
  return !snapshot.docs.some(item => item.id !== currentId);
}

graduateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const id = $("record-id").value;
  const codigo = normalizeCode($("codigo").value);
  const apellido = $("apellido").value.trim();
  const nombre = $("nombre").value.trim();
  const expedicion = $("expedicion").value.trim();
  const fechaISO = getDateFromMonthYear(expedicion);

  if (!codigo || !apellido || !nombre || !expedicion) {
    setMessage($("form-message"), "Completa todos los campos.", "error");
    return;
  }

  if (!fechaISO) {
    setMessage($("form-message"), "Escribe la expedición con el formato: Noviembre 2026.", "error");
    return;
  }

  const saveButton = $("save-button");
  saveButton.disabled = true;
  setMessage($("form-message"), "Guardando…");

  try {
    const unique = await ensureUniqueCode(codigo, id);
    if (!unique) {
      setMessage($("form-message"), "Ese código ya está registrado. Utiliza uno diferente.", "error");
      return;
    }

    const data = { codigo, apellido, nombre, expedicion, fechaISO };

    if (id) {
      await updateDoc(doc(db, COLLECTION, id), data);
      setMessage($("form-message"), "Graduado actualizado correctamente.", "success");
    } else {
      await addDoc(collection(db, COLLECTION), {
        ...data,
        creadoEn: new Date().toISOString()
      });
      setMessage($("form-message"), "Graduado agregado correctamente.", "success");
    }

    resetForm();
    setMessage($("global-message"), "Los cambios se guardaron en Firebase.", "success");
  } catch (error) {
    console.error("Guardar graduado:", error);
    setMessage($("form-message"), explainFirebaseError(error), "error");
  } finally {
    saveButton.disabled = false;
  }
});

$("cancel-edit").addEventListener("click", resetForm);
$("filter-records").addEventListener("input", renderRecords);

async function removeRecord(record) {
  const confirmed = window.confirm(
    `¿Seguro que deseas eliminar a ${record.nombre} ${record.apellido} (${record.codigo})?\n\nEsta acción no se puede deshacer.`
  );
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, COLLECTION, record.id));
    if ($("record-id").value === record.id) resetForm();
    setMessage($("global-message"), `Se eliminó el registro ${record.codigo}.`, "success");
  } catch (error) {
    console.error("Eliminar graduado:", error);
    setMessage($("global-message"), explainFirebaseError(error), "error");
  }
}

async function checkInitialImport() {
  try {
    const configSnapshot = await getDoc(CONFIG_DOC);
    const configData = configSnapshot.exists() ? configSnapshot.data() : null;

    if (configData?.migracionInicialCompletada === true) {
      $("migration-notice").hidden = true;
      return;
    }

    $("migration-notice").hidden = false;
  } catch (error) {
    console.error("Comprobar migración:", error);
    $("migration-notice").hidden = false;
    setMessage($("global-message"), "No se pudo comprobar el estado de la importación. Verifica las reglas de Firestore.", "error");
  }
}

async function importInitialRecords() {
  if (!currentUser) return;

  const button = $("import-button");
  button.disabled = true;
  button.textContent = "Comprobando registros…";

  try {
    let added = 0;
    let alreadyPresent = 0;

    for (const initial of INITIAL_GRADUATES) {
      const q = query(collection(db, COLLECTION), where("codigo", "==", initial.codigo));
      const existing = await getDocs(q);

      if (existing.empty) {
        await addDoc(collection(db, COLLECTION), {
          ...initial,
          creadoEn: new Date().toISOString(),
          origen: "migracion-inicial"
        });
        added++;
      } else {
        alreadyPresent++;
      }
    }

    await setDoc(CONFIG_DOC, {
      migracionInicialCompletada: true,
      fechaMigracion: new Date().toISOString(),
      totalInicial: INITIAL_GRADUATES.length
    }, { merge: true });

    $("migration-notice").hidden = true;
    setMessage(
      $("global-message"),
      `Importación completada: ${added} registros incorporados y ${alreadyPresent} ya existentes conservados. No se sobrescribió ningún registro.`,
      "success"
    );
  } catch (error) {
    console.error("Importación inicial:", error);
    setMessage($("global-message"), explainFirebaseError(error), "error");
  } finally {
    button.disabled = false;
    button.textContent = "Comprobar e importar registros";
  }
}

$("import-button").addEventListener("click", importInitialRecords);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("login-button");
  button.disabled = true;
  button.textContent = "Ingresando…";
  setMessage($("login-message"), "");

  try {
    await signInWithEmailAndPassword(
      auth,
      $("admin-email").value.trim(),
      $("admin-password").value
    );
  } catch (error) {
    console.error("Inicio de sesión:", error);
    setMessage($("login-message"), explainFirebaseError(error), "error");
  } finally {
    button.disabled = false;
    button.textContent = "Iniciar sesión";
  }
});

$("logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
    resetForm();
  } catch (error) {
    setMessage($("global-message"), explainFirebaseError(error), "error");
  }
});

function explainFirebaseError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta administradora con ese correo.",
    "auth/wrong-password": "La contraseña no es correcta.",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo nuevamente.",
    "auth/invalid-email": "El correo electrónico no tiene un formato válido.",
    "auth/network-request-failed": "No se pudo conectar. Comprueba tu conexión a Internet.",
    "permission-denied": "Firebase rechazó la operación. Debemos revisar las reglas de seguridad de Firestore.",
    "failed-precondition": "La operación necesita revisar la configuración de Firestore."
  };
  return messages[code] || `No se pudo completar la operación (${code || "error"}). Revisa la configuración de Firebase y vuelve a intentarlo.`;
}

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  if (user) {
    showAdmin();
  } else {
    showLogin();
  }
});
