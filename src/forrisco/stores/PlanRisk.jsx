import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

import { FULL_PAGE_SIZE } from 'forpdi/src/consts';

var URL = Fluxbone.BACKEND_URL + "planrisk";

var PlanRiskModel = Fluxbone.Model.extend({
	url: URL,
});

var PlanRiskStore = Fluxbone.Store.extend({
	ACTION_NEWPLANRISK: 'planRisk-newPlanRisk',
	ACTION_RETRIEVE_PLANRISK: 'planRisk-retrievePlanRisk',
	ACTION_FIND_UNARCHIVED_FOR_MENU: 'planRisk-getAllUnarchivedForMenu',
	ACTION_FIND_UNARCHIVED: 'planRisk-getAllUnarchived',
	ACTION_LIST_TO_SELECT: 'planRisk-listToSelect',
	ACTION_DELETE_PLANRISK: 'planRisk-deletePlanRisk',
	ACTION_EDIT_PLANRISK: 'planRisk-editPlanRisk',
	dispatchAcceptRegex: /^planRisk-[a-zA-Z0-9]+$/,
	url: URL,
	model: PlanRiskModel,

	newPlanRisk(data) {
		var me = this;
		$.ajax({
			url: this.url + '/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("plaRiskCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getAllUnarchivedForMenu(data) {
		var me = this;
		$.ajax({
			url: this.url + '/unarchivedplanrisk',
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("unarchivedPlanRiskForMenu", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listToSelect(data) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/list-to-select",
			dataType: 'json',
			data,
			success(data) {
				me.trigger("list-to-select", data);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	getAllUnarchived() {
		var me = this;
		$.ajax({
			url: this.url + '/unarchivedplanrisk',
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { pageSize: FULL_PAGE_SIZE },
			success(model) {
				me.trigger("listedunarchivedplanrisk", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrievePlanRisk(data) {
		var me = this;
		var model = new me.model();
		$.ajax({
			url: this.url + '/' + data,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("retrivedplanrisk", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deletePlanRisk(planId) {
		var me = this;
		$.ajax({
			url: me.url + "/" + planId,
			method: 'DELETE',
			success(model) {
				me.trigger("deletePlanRisk", model, planId);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},

	editPlanRisk(data) {
		var me = this;
		$.ajax({
			url: me.url + '/update',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("editPlanRisk", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},
});

export default new PlanRiskStore();
