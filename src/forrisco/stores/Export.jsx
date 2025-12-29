import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

const BASE_URL = `${String(Fluxbone.BACKEND_URL || "").replace(/\/+$/, "")}/forrisco/export`;

const PATH_BY_TYPE = {
  unidade: "unit",
  subunidade: "unit",
  processo: "process",
  risco: "risk",
  acaoPrevencao: "prevenctiveAction",
};

const extractFilename = (disposition) => {
  if (!disposition) return "export.csv";
  const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition);
  if (m?.[1]) return decodeURIComponent(m[1].replace(/['"]/g, ""));
  return "export.csv";
};

const buildUrl = (type) => {
  const path = PATH_BY_TYPE[type];
  if (!path) throw new Error(`Tipo de export não suportado: ${type}`);
  return `${BASE_URL}/${path}`;
};

const readBlobAsText = (blob) =>
  new Promise((resolve) => {
    try {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result || "");
      fr.onerror = () => resolve("");
      fr.readAsText(blob);
    } catch (_) {
      resolve("");
    }
  });

const stripBom = (s = "") => (s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);

const extractErrorMessage = (text, contentType = "") => {
  const ct = String(contentType || "").toLowerCase();
  const s = stripBom(String(text || ""));
  if (ct.includes("json")) {
    try {
      const j = JSON.parse(s);
      const msg =
        j.message ||
        j.error_description ||
        (j.error && j.error.message) ||
        j.error ||
        j.detail ||
        j.title ||
        j.reason ||
        Object.values(j).find((v) => typeof v === "string" && v.trim());
      if (msg) return String(msg);
    } catch (_) {}
  }
  return s.trim();
};

const looksLikeJson = (text) => {
  const s = stripBom(String(text || "")).trim();
  if (!s) return false;
  if (s.startsWith("{") || s.startsWith("[")) return true;
  return /"message"\s*:|'"message"\s*:|\"success\"\s*:/.test(s.slice(0, 2048));
};

const robustJsonError = (text) => {
  try {
    const s = stripBom(String(text || ""));
    const j = JSON.parse(s);
    if (j && typeof j === "object") {
      if (j.message) return String(j.message);
      if (j.success === false && (j.detail || j.title)) return String(j.detail || j.title);
      const first = Object.values(j).find((v) => typeof v === "string" && v.trim());
      if (first) return String(first);
    }
  } catch (_) {}
  return null;
};

const ExportStore = Fluxbone.Store.extend({
  ACTION_RUN: "export-run",
  ACTION_TEMPLATE: "export-template",
  dispatchAcceptRegex: /^export-[a-zA-Z0-9]+$/,

  run(data) {
    const me = this;
    try {
      const url = buildUrl(data?.type);
      const ids = Array.isArray(data?.ids) ? data.ids : [];
      let nativeXhr;
      $.ajax({
        url,
        method: "POST",
        xhrFields: { responseType: "blob" },
        xhr: function () {
          nativeXhr = new window.XMLHttpRequest();
          nativeXhr.responseType = "blob";
          return nativeXhr;
        },
        contentType: "application/json",
        data: JSON.stringify(ids),
        cache: false,
        processData: false,

        success: async (blob, _status, xhr) => {
          try {
            const ct = xhr?.getResponseHeader?.("Content-Type") || blob?.type || "";
            const dispo = xhr.getResponseHeader("Content-Disposition");

            const probeText = await readBlobAsText(blob.slice(0, 2048));

            if ((ct && ct.toLowerCase().includes("json")) || !dispo || looksLikeJson(probeText)) {
              const fullText =
                looksLikeJson(probeText)
                  ? (probeText + (blob.size > 2048 ? await readBlobAsText(blob.slice(2048)) : ""))
                  : await readBlobAsText(blob);

              const parsed = robustJsonError(fullText);
              const msg =
                parsed ||
                extractErrorMessage(fullText, ct) ||
                "Não foi possível concluir a exportação.";
              me.trigger("export-fail", { message: msg, status: xhr?.status });
              return;
            }

            const filename = extractFilename(dispo);
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlObj);
            me.trigger("export-success", { type: data?.type, filename });
          } catch (err) {
            me.trigger("export-fail", {
              message: err?.message || "Falha ao processar o download.",
            });
          }
        },
        async error(xhr) {
          const fallback = "Não foi possível concluir a exportação.";
          try {
            const status = xhr?.status;
            const ct = xhr?.getResponseHeader?.("Content-Type") || "";
            const resp = nativeXhr && nativeXhr.response;

            const headerMsg = xhr?.getResponseHeader?.("X-Error-Message");
            if (headerMsg && headerMsg.trim()) {
              me.trigger("export-fail", { message: headerMsg, status });
              return;
            }

            if (resp instanceof Blob) {
              const text = await readBlobAsText(resp);
              const msg =
                robustJsonError(text) ||
                extractErrorMessage(text, ct) ||
                fallback;
              me.trigger("export-fail", { message: msg, status });
              return;
            }

            const raw =
              xhr?.responseText ||
              (xhr?.responseJSON && JSON.stringify(xhr.responseJSON)) ||
              "";
            const msg =
              robustJsonError(raw) ||
              extractErrorMessage(raw, ct) ||
              fallback;
            me.trigger("export-fail", { message: msg, status });
          } catch (_) {
            me.trigger("export-fail", { message: fallback });
          }
        },
      });
    } catch (e) {
      me.trigger("export-fail", {
        message: e?.message || "Tipo de export inválido.",
      });
    }
  },

  template(data) {
    const me = this;
    try {
      const url = buildUrl(data?.type);
      let nativeXhr;
      $.ajax({
        url,
        method: "POST",
        xhrFields: { responseType: "blob" },
        xhr: function () {
          nativeXhr = new window.XMLHttpRequest();
          nativeXhr.responseType = "blob";
          return nativeXhr;
        },
        contentType: "application/json",
        data: JSON.stringify([]),
        cache: false,
        processData: false,

        success: async (blob, _status, xhr) => {
          try {
            const ct = xhr?.getResponseHeader?.("Content-Type") || blob?.type || "";
            const dispo = xhr.getResponseHeader("Content-Disposition");

            const probeText = await readBlobAsText(blob.slice(0, 2048));
            if ((ct && ct.toLowerCase().includes("json")) || !dispo || looksLikeJson(probeText)) {
              me.trigger("export-fail", {
                message: "Não foi possível exportar a estrutura.",
                status: xhr?.status,
              });
              return;
            }

            const filename = extractFilename(dispo);
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = filename || "export.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlObj);
            me.trigger("export-success", { type: data?.type, filename });
          } catch (err) {
            me.trigger("export-fail", {
              message: "Não foi possível exportar a estrutura.",
            });
          }
        },
        async error(xhr) {
          const message = "Não foi possível exportar a estrutura.";
          try {
            const status = xhr?.status;
            const ct = xhr?.getResponseHeader?.("Content-Type") || "";
            const resp = nativeXhr && nativeXhr.response;

            if (resp instanceof Blob) {
              const text = await readBlobAsText(resp);
              console.error("[ExportStore] template error:", {
                status,
                contentType: ct,
                body: text,
              });
            } else {
              const raw =
                xhr?.responseText ||
                (xhr?.responseJSON && JSON.stringify(xhr.responseJSON)) ||
                "";
              console.error("[ExportStore] template error:", {
                status,
                contentType: ct,
                body: raw,
              });
            }
            me.trigger("export-fail", { message, status });
          } catch (_) {
            me.trigger("export-fail", { message });
          }
        },
      });
    } catch (e) {
      me.trigger("export-fail", {
        message: e?.message || "Tipo de export inválido.",
      });
    }
  },
});

export default new ExportStore();
