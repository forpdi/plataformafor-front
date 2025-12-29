import Fluxbone from 'forpdi/src/forpdi/core/store/Fluxbone.jsx';

const BASE_URL = `${Fluxbone.BACKEND_URL}planrisk`;
const Model = Fluxbone.Model.extend({ url: BASE_URL });

const PlanRiskHistoryStore = Fluxbone.Store.extend({
  ACTION_FIND: 'planrisk-history-find',
  dispatchAcceptRegex: /^planrisk-history-[a-zA-Z0-9_-]+$/,
  model: Model,
  url: BASE_URL,

  find({ planRiskId, page = 1, pageSize = 10, term = '', sortedBy = [] }) {
    const me = this;
    $.ajax({
      url: `${this.url}/${planRiskId}/history`,
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: { page, pageSize, term, sortedBy },
      success(model) { me.trigger('planrisk-history-retrieved', model); },
      error(err) { me.handleRequestErrors([], err); },
    });
  },

  handleDispatch(payload) {
    if (payload.action === this.ACTION_FIND) this.find(payload.data || {});
  },
});

export default new PlanRiskHistoryStore();
