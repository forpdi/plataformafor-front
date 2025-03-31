import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";
import string from "string";

var URL = Fluxbone.BACKEND_URL + "unit";

var unitModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];
		if (string(attrs.name).isEmpty()) {
			errors.push("O nome da unidade é obrigatório.");
		}
		if (errors.length > 0)
			return errors;
	}
});

var UnitStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'unit-create',
	ACTION_DESTROY: 'unit-destroy',
	ACTION_FIND: 'unit-find',
	ACTION_RETRIEVE_UNIT: 'unit-retrieveUnit',
	ACTION_UPDATE_UNIT: 'unit-updateUnit',
	ACTION_ARCHIVE: "unit-archive",
	ACTION_UNARCHIVE: "unit-unarchive",
	ACTION_FIND_ARCHIVED: 'unit-findArchived',
	ACTION_MAIN_MENU_STATE: "unit-mainMenuState",
	ACTION_NEW_UNIT: "unit-newUnit",
	ACTION_DELETE_UNIT: "unit-deleteUnit",
	ACTION_DELETE_SUBUNIT: "unit-deleteSubunit",
	ACTION_DUPLICATE: "unit-duplicateUnits",
	ACTION_NEW_SUBUNIT: "unit-newSubunit",
	ACTION_CUSTOM_UPDATE: "unit-customUpdate",
	ACTION_FIND_BY_PLAN: "unit-findByPlan",
	ACTION_FIND_ALL_BY_PLAN: "unit-findAllByPlan",
	ACTION_FIND_ALL_BY_PLAN_PAGINATED: "unit-findAllByPlanPaginated",
	ACTION_LIST_UNITS: 'unit-listUnits',
	ACTION_LIST_SUBUNIT: "unit-listSubunits",
	ACTION_LIST_SUBUNIT_BY_PLAN: "unit-listSubunitsByPlan",
	ACTION_LIST_TO_SELECT: 'unit-listToSelect',
	dispatchAcceptRegex: /^unit-[a-zA-Z0-9]+$/,
	url: URL,
	model: unitModel,

	findArchived(data) {
		var me = this;
		$.ajax({
			url: me.url + "/archivedunit",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("archiveunitlisted", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("archivedunitlisted", opts);
			}
		});
	},

	findByPlan(data, info){
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("unitbyplan", model, info);
			},
			error(opts, status, errorMsg) {
				me.trigger("unitbyplan", opts);
			}
		});
	},

	findAllByPlan(data, info){
		var me = this;
		$.ajax({
			url: me.url+"/allByPlan",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("allunitsbyplan", model, info);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findAllByPlanPaginated(data, info){
		var me = this;
		$.ajax({
			url: me.url+"/allByPlanPaginated",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("allunitsbyplanpaginated", model, info);
			},
			error(opts, status, errorMsg) {
				me.trigger("allunitsbyplanpaginated", opts);
			}
		});
	},

	listUnits(data) {
		var me = this;
		$.ajax({
			url: me.url + "/units",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("unit-listUnits", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("unit-listUnits", opts);
			}
		});
	},

	newUnit(data) {
		var me = this;
		$.ajax({
			url: me.url + '/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				unit: data
			}),
			success(model) {
				me.trigger("unitcreated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	duplicateUnits(data) {
		var me = this;
		$.ajax({
			url: me.url + '/duplicate',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				units: data.units,
				planRisk: data.planRisk
			}),
			success(model) {
				me.trigger("duplicatedUnits", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	archive(data) {
		var me = this;
		$.ajax({
			url: me.url + "/archive",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("unitarchived", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("unitarchived", opts);
			}
		});
	},

	unarchive(data) {
		var me = this;
		$.ajax({
			url: me.url + "/unarchive",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("unitunarchived", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("unitunarchived", opts);
			}
		});
	},

	customUpdate(data) {
		var me = this;
		$.ajax({
			url: me.url + "/update",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				unit: data
			}),
			success(model) {
				me.trigger("unitUpdated", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("unitUpdated", {msg: opts.responseJSON.message, data: {id: null}})
			}
		});
	},

	retrieveUnit(unitId) {
		var me = this;
		$.ajax({
			url: `${me.url}/${unitId}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("unitRetrieved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateUnit(data) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				unit: data.unit,
			}),
			success(model) {
				me.trigger("unitUpdated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteUnit(data) {
		var me = this;
		me.deleteUnitOrSubunit(data, 'unitDeleted');
	},

	deleteSubunit(data) {
		var me = this;
		me.deleteUnitOrSubunit(data, 'subunitDeleted');
	},

	deleteUnitOrSubunit(data, actionName) {
		var me = this;
		$.ajax({
			url: `${me.url}/${data.id}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger(actionName, model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newSubunit(data) {
		var me = this;
		$.ajax({
			url: me.url + '/subnew',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				unit: data
			}),
			success(model) {
				me.trigger("subunitCreated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listSubunits(data, payload) {
		var me = this;
		const { unitId } = data;
		$.ajax({
			url: `${me.url}/listsub/${unitId}`,
			method: 'GET',
			dataType: 'json',
			data: data,
			contentType: 'application/json',
			success(model) {
				me.trigger("subunitsListed", model, payload);
			},
			error(opts, status, errorMsg) {
				me.trigger("subunitsListed", opts);
			}
		});
	},

	listSubunitsByPlan(data, node) {
		var me = this;
		$.ajax({
			url: `${me.url}/listsub`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: {planId: data},
			success(model) {
				me.trigger("allSubunitsListed", model, node);
			},
			error(opts, status, errorMsg) {
				me.trigger("allSubunitsListed", opts);
			}
		});
	},

	listToSelect(data) {
		var me = this;
		$.ajax({
			url: `${me.url}/list-to-select`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data,
			success(data) {
				me.trigger('listToSelect', data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	mainMenuState(data) {
		var me = this;
		me.trigger("getmainmenustate", data);
	}
});

export default new UnitStore();
