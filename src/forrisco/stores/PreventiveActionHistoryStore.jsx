// forrisco/stores/PreventiveActionHistoryStore.jsx
import Fluxbone from 'forpdi/src/forpdi/core/store/Fluxbone.jsx';

/**
 * Store de Histórico de Ações de Prevenção
 * Padrão baseado em PlanRiskHistoryStore.jsx
 */
const BASE_URL = `${Fluxbone.BACKEND_URL}risk/action`;
const Model = Fluxbone.Model.extend({ url: BASE_URL });

const PreventiveActionHistoryStore = Fluxbone.Store.extend({
  ACTION_FIND: 'preventive-action-history-find',
  dispatchAcceptRegex: /^preventive-action-history-[a-zA-Z0-9_-]+$/,
  model: Model,
  url: BASE_URL,

  find({ actionId, page = 1, pageSize = 10, term = '', sortedBy = [] }) {
    const me = this;
    $.ajax({
      url: `${this.url}/${actionId}/history`,
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: { page, pageSize, term, sortedBy },
      success(model) { me.trigger('preventive-action-history-retrieved', model); },
      error(err) { me.handleRequestErrors([], err); },
    });
  },

  handleDispatch(payload) {
    if (payload.action === this.ACTION_FIND) this.find(payload.data || {});
  },
});

export default new PreventiveActionHistoryStore();
