import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

const BASE_URL = `${String(Fluxbone.BACKEND_URL || "").replace(/\/+$/, "")}/forrisco/import`;

const PATH_BY_TYPE = {
  preventiveaction: "preventive-action",
  subunidade: "subunit",
  processo: "process",
  risco: "risk",
  unidade: "unit",
};

const buildUrl = (type) => {
  const key = String(type || "").toLowerCase();
  const path = PATH_BY_TYPE[key];
  if (!path) throw new Error(`Tipo de import não suportado: ${type}`);
  return `${BASE_URL}/${path}`;
};

const pickNum = (v) => {
  if (v && typeof v === "object") {
    if (v.target && "value" in v.target) v = v.target.value;
    else if ("value" in v) v = v.value;
    else if ("id" in v) v = v.id;
  }
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const normalizeFileName = (name) => (name && String(name)) || "import.csv";

const ImportStore = Fluxbone.Store.extend({
  ACTION_RUN: "import-run",
  dispatchAcceptRegex: /^import-[a-zA-Z0-9]+$/,

  run(data) {
    const me = this;
    try {
      const type = String(data?.type || "unidade").toLowerCase();

      const planRiskId = pickNum(data?.planRiskId);
      const parentId   = pickNum(data?.parentId);
      const unitId     = pickNum(data?.unitId);
      const riskId     = pickNum(data?.riskId);
      const file       = data?.file;

      if (!planRiskId) throw new Error("planRiskId é obrigatório.");
      if (!file)       throw new Error("Arquivo CSV é obrigatório.");
      if (type === "subunidade" && !parentId) {
        throw new Error("parentId (unidade pai) é obrigatório para subunidade.");
      }
      if ((type === "processo" || type === "risco") && !unitId) {
        throw new Error("unitId (unidade ou subunidade) é obrigatório para este tipo.");
      }
      if (type === "preventiveaction" && !riskId) {
        throw new Error("riskId (risco-alvo) é obrigatório para ação preventiva.");
      }

      const url = buildUrl(type);
      const form = new FormData();
      form.append("planRiskId", String(planRiskId));
      form.append("file", file, normalizeFileName(file.name));

      if (type === "subunidade") form.append("parentId", String(parentId));
      if (type === "processo" || type === "risco") form.append("unitId", String(unitId));
      if (type === "preventiveaction") form.append("riskId", String(riskId));

      $.ajax({
        url,
        method: "POST",
        data: form,
        processData: false,
        contentType: false,
        cache: false,
        success(resp) {
          me.trigger("import-success", { type, result: resp });
        },
        error(xhr) {
          let message = "Não foi possível concluir a importação.";
          try {
            const ct = xhr?.getResponseHeader?.("Content-Type") || "";
            if (ct.includes("application/json") && xhr?.responseJSON) {
              message = xhr.responseJSON?.message || message;
            } else if (typeof xhr?.responseText === "string" && xhr.responseText.trim()) {
              message = xhr.responseText;
            }
          } catch (_) {}
          me.trigger("import-fail", { message, status: xhr?.status });
        },
      });
    } catch (e) {
      me.trigger("import-fail", { message: e?.message || "Falha ao iniciar a importação." });
    }
  },
});

export default new ImportStore();
