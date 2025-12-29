import Fluxbone from 'forpdi/src/forpdi/core/store/Fluxbone.jsx';

const BASE = Fluxbone.BACKEND_URL;
const UNIT_BASE = `${BASE}unit`;
const RISK_BASE = `${BASE}risk`;
const MONITORING_BASE = `${RISK_BASE}/monitoring`;
const CONTINGENCY_BASE = `${RISK_BASE}/contingency`;
const PRI_BASE = `${BASE}planrisk/item`;
const PROCESS_BASE = `${BASE}process`;
const INCIDENT_BASE = `${RISK_BASE}/incident`;
const ITEM_BASE = `${BASE}item`;

const HistoryModel = Fluxbone.Model.extend({ url: UNIT_BASE });

const HistoryStore = Fluxbone.Store.extend({
  ACTION_FIND: 'history-find',
  dispatchAcceptRegex: /^history-[a-zA-Z0-9]+$/,
  url: UNIT_BASE,
  model: HistoryModel,

  find(params) {
    const me = this;
    const { entityId, entityName = 'Unit', page, pageSize, term, sortedBy } = params;

    const name = String(entityName).toLowerCase();

    const isUnit            = name === 'unit';
    const isRisk            = name === 'risk';
    const isMonitoring      = name === 'monitoring';
    const isContingency     = (name === 'contingency' || name === 'contigency');
    const isPlanRiskItem    = (name === 'planriskitem' || name === 'plan_risk_item');
    const isPlanRiskSubItem = (name === 'planrisksubitem' || name === 'plan_risk_subitem' || name === 'planrisksubitem');
    const isProcess         = name === 'process';
    const isIncident        = name === 'incident';
    const isItem            = name === 'item';
    const isSubItem         = name === 'subitem';

    const fullUrl =
      isItem            ? `${ITEM_BASE}/edit-history?itemId=${entityId}` :
      isSubItem         ? `${ITEM_BASE}/subitem/edit-history?subitemId=${entityId}` :
      isRisk            ? `${RISK_BASE}/edit-history?riskId=${entityId}` :
      isProcess         ? `${PROCESS_BASE}/${entityId}/history` :
      isIncident        ? `${INCIDENT_BASE}/${entityId}/history` :
      isMonitoring      ? `${MONITORING_BASE}/${entityId}/history` :
      isContingency     ? `${CONTINGENCY_BASE}/edit-history?contingencyId=${entityId}` :
      isPlanRiskItem    ? `${PRI_BASE}/edit-history?itemId=${entityId}` :
      isPlanRiskSubItem ? `${PRI_BASE}/subitem/edit-history?subitemId=${entityId}` :
                          `${UNIT_BASE}/${entityId}/history`;

    if (this._xhr && this._xhr.readyState !== 4) {
      try { this._xhr.abort(); } catch (e) {}
    }

    /* eslint-disable no-console */
    console.log('[HistoryStore] Chamando:', fullUrl, {
      entityId, entityName, page, pageSize, term, sortedBy,
    });

    const data = { page, pageSize, term };
    if (sortedBy && sortedBy.length) data.sortedBy = sortedBy;

    this._xhr = $.ajax({
      url: fullUrl,
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data,
      traditional: true,
      success(model) {
        const listLike = model?.list ?? model?.data ?? model ?? [];
        const payload = {
          data: listLike,
          total: model?.total ?? (Array.isArray(listLike) ? listLike.length : 0),
        };
        console.log('[HistoryStore] Sucesso:', payload);
        me.trigger('history-retrieved', payload);
      },
      error(opts) {
        console.error('[HistoryStore] Erro AJAX:', opts);
        me.handleRequestErrors([], opts);
      },
    });
  },
});

export default new HistoryStore();
