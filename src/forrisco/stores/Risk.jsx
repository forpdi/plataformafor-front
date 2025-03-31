import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";
import string from "string";

var URL = Fluxbone.BACKEND_URL+"risk";

var RiskModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];
		if (string(attrs.name).isEmpty()) {
			errors.push("O nome do risco é obrigatório.");
		}
		if (errors.length > 0)
			return errors;
	}
});

var RiskStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'risk-create',
	ACTION_DESTROY: 'risk-destroy',
	ACTION_FIND: 'risk-find',
	ACTION_RETRIEVE: 'risk-retrieve',
	ACTION_UPDATE: 'risk-update',
	ACTION_ARCHIVE: "risk-archive",
	ACTION_UNARCHIVE: "risk-unarchive",
	ACTION_FIND_ARCHIVED: 'risk-findArchived',
	ACTION_FILTER_RISKS: 'risk-filterRisks',
	ACTION_FIND_BY_SUBUNITS: 'risk-findBySubunits',
	ACTION_MAIN_MENU_STATE: "risk-mainMenuState",
	ACTION_DELETE: "risk-delete",
	ACTION_NEWRISK: "risk-newRisk",
	ACTION_CUSTOM_UPDATE: "risk-customUpdate",
	ACTION_FIND_BY_PLAN: 'risk-findByPlan',
	ACTION_REPLICATE_RISK: "risk-replicateRisk",
	ACTION_FIND_INCIDENTS_BY_PLAN: "risk-findIncdentsByPlan",
	ACTION_FIND_FILTERED_ACTIONS: "risk-findFilteredActions",
	ACTION_FIND_MONITORS_BY_PLAN: "risk-findMonitorsByPlan",
	ACTION_FIND_HISTORY_BY_UNIT:"risk-findHistoryByUnit",
	ACTION_FIND_MONITOR_HISTORY_BY_UNIT:"risk-findMonitorHistoryByUnit",
	ACTION_FIND_RISK: "risk-findRisk",
	ACTION_LIST_PREVENTIVE_ACTIONS:"risk-listPreventiveActions",
	ACTION_NEW_PREVENTIVE_ACTION:"risk-newPreventiveAction",
	ACTION_DELETE_PREVENTIVE_ACTION:"risk-deletePreventiveAction",
	ACTION_UPDATE_PREVENTIVE_ACTION:"risk-updatePreventiveAction",
	ACTION_FIND_PREVENTIVE_ACTION:"risk-findPreventiveAction",
	ACTION_LIST_MONITOR: "risk-listMonitor",
	ACTION_NEW_MONITOR: "risk-newMonitor",
	ACTION_DELETE_MONITOR: "risk-deleteMonitor",
	ACTION_UPDATE_MONITOR: "risk-updateMonitor",
	ACTION_FIND_MONITOR_BY_ID:"risk-findMonitor",
	ACTION_LIST_INCIDENT: "risk-listIncident",
	ACTION_NEW_INCIDENT: "risk-newIncident",
	ACTION_FIND_INCIDENT: "risk-findIncident",
	ACTION_DELETE_INCIDENT: "risk-deleteIncident",
	ACTION_UPDATE_INCIDENT: "risk-updateIncident",
	ACTION_LIST_CONTINGENCY: "risk-listContingency",
	ACTION_NEW_CONTINGENCY: "risk-newContingency",
	ACTION_DELETE_CONTINGENCY: "risk-deleteContingency",
	ACTION_UPDATE_CONTINGENCY: "risk-updateContingency",
	ACTION_FIND_CONTINGENCY:"risk-findContingency",
	ACTION_RETRIEVE_ACTIVITIES: "risk-retrieveActivities",
	ACTION_LIST_RISKS_BY_LEVEL: "risk-listRisksByLevel",
	ACTION_LIST_RISKS_BY_USER: "risk-listRisksByUser",
	ACTION_PAGINATE_INCIDENTS: 'risk-paginateIncidents',
	ACTION_FIND_INCIDENTS_BY_UNIT: 'unit-findIncidentsByUnit',
	ACTION_LIST_ALL_UNARCHIVED: "risk-listAllUnarchived",
	ACTION_LIST_ALL_MONITORS: "risk-listAllMonitors",
	dispatchAcceptRegex: /^risk-[a-zA-Z0-9]+$/,
	url: URL,
	model: RiskModel,

	findRisk(riskId) {
		var me = this;
		$.ajax({
			url: me.url+"/"+riskId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findRisk", model);
			},
			error(opts) {
				me.trigger("notFound", opts);
				me.handleRequestErrors([], opts);
			}
		});
	},


	findArchived(data) {
		var me = this;
		$.ajax({
			url: me.url+"/archivedrisk",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("archiverisklisted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	filterRisks(data, payload) {
		var me = this;
		var { planRiskId, page, pageSize, filters, sortedBy } = data;
		$.ajax({
			url: `${me.url}/filter/${planRiskId}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { page, pageSize, filters: JSON.stringify(filters), sortedBy },
			success(model) {
				me.trigger("risks-filtered", model, payload);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findBySubunits(data, node) {
		var me = this;
		$.ajax({
			url: `${me.url}/listbysubunits/${data.unit.id}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("riskbysubunits", model, node);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listAllUnarchived(data) {
		var me = this;
		$.ajax({
			url: me.url + "/unarchivedrisklisted",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("unarchivedrisklisted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newRisk(data) {
		var me = this;

		$.ajax({
			url: me.url + '/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				risk: data
			}),
			success(model) {
				me.trigger("riskcreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	archive(data) {
		var me = this;
		$.ajax({
			url: me.url+`/archive/${data}`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("riskarchived", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	unarchive(data) {
		var me = this;
		$.ajax({
			url: me.url+`/unarchive/${data}`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("riskunarchived", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	delete(data) {
		var me = this;
		$.ajax({
			url: me.url+"/"+data,
			method: 'DELETE',
			success(model) {
				me.trigger("riskDelete", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	customUpdate(data) {
		var me = this;
		$.ajax({
			url: me.url+"/update",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				risk: data
			}),
			success(model) {
				me.trigger("riskUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findByPlan(data) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("riskbyplan", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	replicateRisk(data) {
		var me = this;
		$.ajax({
			url: me.url + "/replicate",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("riskreplicated", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	findHistoryByUnit(data) {
		var me = this;
		$.ajax({
			url: me.url+"/history",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {unitId: data.unit, planId: data.plan, threat: data.threat},
			success(model) {
				me.trigger("historyByUnit", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findIncident(incidentId) {
		var me = this;
		$.ajax({
			url: me.url + "/incident/" + incidentId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findIncident", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},


	findIncdentsByPlan(data) {
		var me = this;
		$.ajax({
			url: me.url+"/incidents",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("incidentbByPlan", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findMonitorsByPlan(data) {
		var me = this;
		$.ajax({
			url: me.url+"/monitors",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("monitorByPlan", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},



	findMonitorHistoryByUnit(data) {
		var me = this;
		$.ajax({
			url: me.url+"/monitorHistory",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {unitId: data.unit, planId: data.plan},
			success(model) {
				me.trigger("monitorHistoryByUnit", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listMonitor(data) {
		var me = this;
		const { riskId, page, pageSize, term, sortedBy } = data;
		$.ajax({
			url: me.url + "/monitor",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { riskId, page, pageSize, term, sortedBy },
			success(model) {
				me.trigger("monitorListed", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newMonitor(data) {
		var me = this;
		$.ajax({
			url: me.url + '/monitornew',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				monitor: data.monitor,
			}),
			success(model) {
				me.trigger("monitorCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteMonitor(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/monitor/${data.monitorId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("monitorDeleted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateMonitor(data) {
		var me = this;
		$.ajax({
			url: me.url + '/monitor/update',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				monitor: data.monitor,
			}),
			success(model) {
				me.trigger("monitorUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findMonitor(monitorId) {
		const me = this;
		$.ajax({
			url: me.url + "/monitor/" + monitorId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findMonitor", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},

	listAllMonitors(data) {
		var me = this;
		$.ajax({
			url: me.url + "/all-monitors",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("allMonitorsListed", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listPreventiveActions(data) {
		var me = this;
		const { riskId, page, pageSize, term, sortedBy } = data;
		$.ajax({
			url: me.url + "/action",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { riskId, page, pageSize, term, sortedBy },
			success(model) {
				me.trigger("preventiveActionsListed", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findPreventiveAction(actionId) {
		const me = this;
		$.ajax({
			url: me.url + "/action/" + actionId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findPreventiveAction", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},

	findFilteredActions(data) {
		var me = this;
		$.ajax({
			url: me.url + "/filteredActions",
			method: 'GET',
			dataType: 'json',
			data: {planId: data.plan},
			success(model) {
				me.trigger("filteredActionsRetrieved", model, data);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newPreventiveAction(data) {
		var me = this;
		$.ajax({
			url: me.url + '/actionnew',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				action: data.action,
			}),
			success(model) {
				me.trigger("preventiveActionCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deletePreventiveAction(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/action/${data.actionId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("preventiveActionDeleted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updatePreventiveAction(data) {
		var me = this;
		$.ajax({
			url: me.url + '/action/update',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				action: data.action,
			}),
			success(model) {
				me.trigger("preventiveActionUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listIncident(data) {
		var me = this;
		const { riskId, page, pageSize, term, sortedBy } = data;
		$.ajax({
			url: me.url + "/incident",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { riskId, page, pageSize, term, sortedBy },
			success(model) {
				me.trigger("incidentListed", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newIncident(data) {
		var me = this;
		$.ajax({
			url: me.url + '/incidentnew',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				incident: data.incident,
			}),
			success(model) {
				me.trigger("incidentCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteIncident(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/incident/${data.incidentId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("incidentDeleted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateIncident(data) {
		var me = this;
		$.ajax({
			url: me.url + '/incident/update',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				incident: data.incident,
			}),
			success(model) {
				me.trigger("incidentUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listContingency(data) {
		var me = this;
		const { riskId, page, pageSize, term, sortedBy } = data;
		$.ajax({
			url: me.url + "/contingency",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { riskId, page, pageSize, term, sortedBy },
			success(model) {
				me.trigger("contingencyListed", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findContingency(contingencyId) {
		const me = this;
		$.ajax({
			url: me.url + "/contingency/" + contingencyId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findContingency", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		})
	},

	newContingency(data) {
		var me = this;
		$.ajax({
			url: me.url + '/contingencynew',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				contingency: data.contingency,
			}),
			success(model) {
				me.trigger("contingencyCreated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteContingency(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/contingency/${data.contingencyId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("contingencyDeleted", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateContingency(data) {
		var me = this;
		$.ajax({
			url: me.url + '/contingency/update',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				contingency: data.contingency,
			}),
			success(model) {
				me.trigger("contingencyUpdated", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveActivities(data) {
		var me = this;
		$.ajax({
			url: me.url + "/activity",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {riskId: data},
			success(model) {
				me.trigger("retrieveActivities", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listRisksByLevel(data) {
		var me = this;
		$.ajax({
			url: me.url + "/listByLevel",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("riskByUser", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);			}
		});
	},
	
	listRisksByUser(data) {
		var me = this;
		$.ajax({
			url: me.url + "/listByUser",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("riskByLevel", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);			}
		});
	},
	

	paginateIncidents(data) {
		var me = this;
		$.ajax({
			url: me.url + "/incidentsPaginated",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(response) {
				me.trigger("paginatedIncidents", response);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findIncidentsByUnit() {
		var me = this;
		$.ajax({
			url: me.url + "/incidentByUnit",
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("findTerms", model, data);
			},
			error(opts) {
				me.trigger("findTerms", opts);
			}
		});
	},

	mainMenuState(data) {
		var me = this;
		me.trigger("getmainmenustate", data);
	}
});

export default new RiskStore();
