import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";
import string from "string";

var URL = `${Fluxbone.BACKEND_URL}process`;

var processModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];
		if (string(attrs.name).isEmpty()) {
			errors.push("O nome do processo é obrigatório.");
		}
		if (errors.length > 0)
			return errors;
	}
});

var ProcessStore = Fluxbone.Store.extend({
	ACTION_RETRIEVE_PROCESS: 'process-retrieveProcess',
	ACTION_LIST_BY_UNIT: 'process-listProcessByUnit',
	ACTION_LIST_BY_UNIT_LINKED_TO_RISKS: 'process-listProcessesLinkedToRisks',
	ACTION_LIST_BY_PLAN_LINKED_TO_RISKS: 'process-listProcessesLinkedToRisksByPlan',
	ACTION_LIST_BY_PLAN: 'process-listProcessByPlan',
	ACTION_CREATE: 'process-newProcess',
	ACTION_DELETE: 'process-deleteProcess',
	ACTION_UPDATE: 'process-updateProcess',
	ACTION_LIST_OBJECTIVES_BY_PLAN: 'process-listObjectivesByPlan',
	dispatchAcceptRegex: /^process-[a-zA-Z0-9]+$/,
	url: URL,
	model: processModel,

	listProcessByUnit(data) {
		var me = this;
		var { id, term, page, pageSize, sortedBy } = data;
		$.ajax({
			url: `${me.url}/${id}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {
				page,
				pageSize,
				term,
				sortedBy,
			},
			success(model) {
				me.trigger("processListedByUnit", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listProcessesLinkedToRisks(data) {
		var me = this;
		const { id } = data;
		$.ajax({
			url: `${me.url}/list-linked-to-risks`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { unitId: id },
			success(model) {
				me.trigger("listProcessesLinkedToRisks", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listProcessesLinkedToRisksByPlan(data) {
		var me = this;
		const { id } = data;
		$.ajax({
			url: `${me.url}/list-linked-to-risks-by-plan`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { planId: id },
			success(model) {
				me.trigger("listProcessesLinkedToRisksByPlan", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listProcessByPlan(data, opts) {
		var me = this;
		$.ajax({
			url: `${me.url}/list-by-plan`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data,
			success(model) {
				me.trigger("listProcessByPlan", model, opts);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newProcess(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/new`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data.process),
			success(model) {
				me.trigger("processCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteProcess(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/${data.processId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("processDeleted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateProcess(data) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data.process),
			success(model) {
				me.trigger("processUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveProcess(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/process/${data}`,
			methor: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("processRetrieved", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},

	mainMenuState(data){
		var me = this;
		me.trigger("getmainmenustate", data);
	},

	listObjectivesByPlan(data, opts) {
		var me = this;
		$.ajax({
			url: `${me.url}/list-objetives-by-plan`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data,
			success(model) {
				me.trigger("listObjectivesByPlan", model, opts);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	}
});

export default new ProcessStore();
