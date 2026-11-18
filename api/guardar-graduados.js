const crypto = require("crypto");

const OWNER = process.env.GITHUB_OWNER || "Cursos-EducaDigital";
const REPO = process.env.GITHUB_REPO || "estudiantes-educadigital";
const BRANCH = process.env.GITHUB_BRANCH || "";
const FILE_PATH = process.env.GRADUADOS_PATH || "graduados.js";
const COOKIE_NAME = "educa_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function send(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function signature(timestamp) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET)
    .update(`educa-digital:${timestamp}`)
    .digest("hex");
}

function validSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader.split(";").map(v => v.trim())
    .find(v => v.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return false;

  const token = decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1));
  const [timestamp, suppliedSignature] = token.split(".");
  const time = Number(timestamp);

  if (!Number.isFinite(time) || !suppliedSignature) return false;
  if (Date.now() - time > SESSION_SECONDS * 1000 || time > Date.now() + 60000) return false;
  return safeEqual(signature(timestamp), suppliedSignature);
}

function parseBody(req) {
  // Vercel puede entregar el cuerpo ya procesado en req.body.
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body)); }
    catch { return Promise.reject(new Error("El cuerpo de la solicitud no es JSON válido.")); }
  }
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("La solicitud supera el tamaño permitido."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); }
      catch { reject(new Error("El cuerpo de la solicitud no es JSON válido.")); }
    });
    req.on("error", reject);
  });
}

function validarRegistros(records) {
  if (!Array.isArray(records) || records.length > 5000) {
    throw new Error("La lista de graduados no es válida.");
  }

  const codigos = new Set();
  const limpios = records.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Hay un registro inválido.");
    const codigo = String(item.codigo || "").trim();
    const apellido = String(item.apellido || "").trim();
    const nombre = String(item.nombre || "").trim();
    const expedicion = String(item.expedicion || "").trim();
    const fechaISO = item.fechaISO ? String(item.fechaISO).trim() : "";

    if (!codigo || !apellido || !nombre || !expedicion) {
      throw new Error("Todos los graduados deben tener código, apellido, nombre y expedición.");
    }
    if (codigo.length > 30 || apellido.length > 60 || nombre.length > 60 || expedicion.length > 50) {
      throw new Error("Uno de los campos supera la longitud permitida.");
    }
    if (fechaISO && !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
      throw new Error(`La fecha del código ${codigo} no es válida.`);
    }

    const clave = codigo.toLocaleLowerCase("es");
    if (codigos.has(clave)) throw new Error(`El código ${codigo} está duplicado.`);
    codigos.add(clave);

    return fechaISO
      ? { codigo, apellido, nombre, expedicion, fechaISO }
      : { codigo, apellido, nombre, expedicion };
  });

  return limpios;
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `GitHub respondió ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Método no permitido." });
  }

  // La función solo acepta solicitudes originadas desde el mismo sitio.
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return send(res, 403, { error: "Origen no autorizado." });
    } catch {
      return send(res, 403, { error: "Origen no autorizado." });
    }
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET || !process.env.GITHUB_TOKEN) {
    return send(res, 500, { error: "Falta configurar la contraseña, la clave de sesión o el token de GitHub en Vercel." });
  }

  let body;
  try { body = await parseBody(req); }
  catch (error) { return send(res, 400, { error: error.message }); }

  if (body.action === "login") {
    if (!safeEqual(body.password, process.env.ADMIN_PASSWORD)) {
      return send(res, 401, { error: "La contraseña ingresada no es correcta." });
    }

    const timestamp = String(Date.now());
    const token = `${timestamp}.${signature(timestamp)}`;
    const cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`;
    return send(res, 200, { ok: true }, { "Set-Cookie": cookie, "Cache-Control": "no-store" });
  }

  if (body.action === "logout") {
    return send(res, 200, { ok: true }, {
      "Set-Cookie": `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
      "Cache-Control": "no-store"
    });
  }

  if (body.action !== "save") return send(res, 400, { error: "Acción no reconocida." });
  if (!validSession(req)) return send(res, 401, { error: "La sesión administrativa venció. Vuelva a ingresar." });

  let records;
  try { records = validarRegistros(body.records); }
  catch (error) { return send(res, 400, { error: error.message }); }

  if (!Array.isArray(body.originalCodes)) {
    return send(res, 400, { error: "No se pudo verificar la lista original. Recargue el panel." });
  }

  try {
    const rutaArchivo = FILE_PATH.split("/").map(encodeURIComponent).join("/");
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${rutaArchivo}${BRANCH ? `?ref=${encodeURIComponent(BRANCH)}` : ""}`;
    const current = await githubRequest(apiUrl);
    const source = Buffer.from(current.content.replace(/\n/g, ""), "base64").toString("utf8");

    const start = source.indexOf("/* === INICIO DATOS === */");
    const end = source.indexOf("/* === FIN DATOS === */");
    if (start < 0 || end < start) {
      return send(res, 500, { error: "No se encontró el bloque de datos en graduados.js. No se modificó el archivo." });
    }

    const declarationStart = source.indexOf("const graduados =", start);
    const arrayStart = source.indexOf("[", declarationStart);
    const arrayEnd = source.lastIndexOf("];", end);
    if (declarationStart < 0 || arrayStart < 0 || arrayEnd < arrayStart) {
      return send(res, 500, { error: "No se pudo leer la lista actual de graduados. No se modificó el archivo." });
    }

    let currentRecords;
    try { currentRecords = JSON.parse(source.slice(arrayStart, arrayEnd + 1)); }
    catch {
      return send(res, 500, { error: "La lista actual no se pudo interpretar. No se modificó el archivo." });
    }

    const codigosActuales = currentRecords.map(item => String(item.codigo)).sort();
    const codigosBase = body.originalCodes.map(String).sort();

    // Protección contra sobrescribir una versión más reciente o una lista distinta.
    if (JSON.stringify(codigosActuales) !== JSON.stringify(codigosBase)) {
      return send(res, 409, {
        error: "El listado publicado cambió desde que abrió este panel. Recargue carga.html para obtener la versión más reciente antes de guardar."
      });
    }

    const nuevoBloque = `/* === INICIO DATOS === */\nconst graduados = ${JSON.stringify(records, null, 4)};\n/* === FIN DATOS === */`;
    const nuevoContenido = source.slice(0, start) + nuevoBloque + source.slice(end + "/* === FIN DATOS === */".length);
    const contenidoBase64 = Buffer.from(nuevoContenido, "utf8").toString("base64");

    await githubRequest(apiUrl.split("?")[0], {
      method: "PUT",
      body: JSON.stringify({
        message: `Actualizar listado de graduados (${records.length} registros)`,
        content: contenidoBase64,
        sha: current.sha,
        ...(BRANCH ? { branch: BRANCH } : {})
      })
    });

    return send(res, 200, {
      ok: true,
      count: records.length,
      message: "La lista completa fue guardada en GitHub."
    }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("Error guardando graduados en GitHub:", error);
    const status = error.status === 409 || error.status === 422 ? 409 : 502;
    return send(res, status, {
      error: status === 409
        ? "GitHub detectó un cambio simultáneo. Recargue el panel antes de volver a guardar."
        : "No se pudo actualizar GitHub. Verifique el token, los permisos y la rama configurada."
    });
  }
};
