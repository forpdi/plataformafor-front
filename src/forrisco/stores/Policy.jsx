import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";
import ItemStore from "forpdi/src/forrisco/stores/Item.jsx";
import { data } from "jquery";
import string from "string";

var URL = Fluxbone.BACKEND_URL+"policy";

var PolicyModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];
		if (string(attrs.name).isEmpty()) {
			errors.push("O nome da política é obrigatório.");
		}
		if (errors.length > 0)
			return errors;
	}
});

var PolicyStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'policy-create',
	ACTION_DESTROY: 'policy-destroy',
	ACTION_FIND: 'policy-find',
	ACTION_FIND_POLICY: 'policy-findPolicy',
	ACTION_UPDATE: 'policy-update',
	ACTION_ARCHIVE: "policy-archive",
	ACTION_UNARCHIVE: "policy-unarchive",
	ACTION_FIND_ARCHIVED: 'policy-findArchived',
	ACTION_FIND_UNARCHIVED_FOR_MENU: 'policy-findUnarchivedForMenu',
	ACTION_LIST_TO_SELECT: 'policy-listToSelect',
	ACTION_FIND_UNARCHIVED: 'policy-findUnarchived',
	ACTION_MAIN_MENU_STATE: "policy-mainMenuState",
	ACTION_DELETE: "policy-delete",
	ACTION_NEWPOLICY: "policy-newPolicy",
	ACTION_CUSTOM_UPDATE: "policy-customUpdate",
	ACTION_RETRIEVE_RISK_LEVEL: "policy-retrieveRiskLevel",
	ACTION_RETRIEVE_FILLED_SECTIONS: 'policy-retrieveFilledSections',
	dispatchAcceptRegex: /^policy-[a-zA-Z0-9]+$/,
	url: URL,
	model: PolicyModel,


	findPolicy(data){
		var me = this;
		$.ajax({
			url: me.url+"/"+data,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("findpolicy", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},


	findArchived(data){
		var me = this;
		$.ajax({
			url: me.url+"/archivedpolicy",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("archivepolicylisted", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findUnarchivedForMenu(data){
		var me = this;
		$.ajax({
			url: me.url+"/unarchivedpolicy",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("unarchivedPolicyForMenu", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listToSelect() {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/list-to-select",
			dataType: 'json',
			success(data) {
				me.trigger("list-to-select", data);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	findUnarchived(data){
		var me = this;
		$.ajax({
			url: me.url+"/unarchivedpolicy",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("unarchivedpolicylisted", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveRiskLevel(data){
		var me = this;
		$.ajax({
			url: me.url+"/risklevel/"+data,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("retrieverisklevel", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	newPolicy(data){
		var me = this;
		$.ajax({
			url: me.url+'/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				policy: data
			}),
			success(model) {
				/*ItemStore.dispatch({
					action: ItemStore.ACTION_CREATE_INFO,
					data: model.data
				});*/
				me.trigger("policycreated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	archive(data){
		var me = this;
		$.ajax({
			url: me.url+"/archive",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("policyarchived", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	unarchive(data){
		var me = this;
		$.ajax({
			url: me.url+"/unarchive",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id
			}),
			success(model) {
				me.trigger("policyunarchived", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	delete(policyId){
		var me = this;
		$.ajax({
			url: me.url + "/" + policyId,
			method: 'DELETE',
			success(model) {
				me.trigger("policyDeleted", model, policyId);
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
				policy: data
			}),
			success(model) {
				me.trigger("policyUpdated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveFilledSections(data) {
		var me = this;
		$.ajax({
			url: me.url+"/" + data.id + "/filledsections",
			method: 'GET',
			dataType: 'json',
			success(response) {
				me.trigger("retrieveFilledSections", response.data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	mainMenuState(data){
		var me = this;
		me.trigger("getmainmenustate", data);
	}
});

export default new PolicyStore();
