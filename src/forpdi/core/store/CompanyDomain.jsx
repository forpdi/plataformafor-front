
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"companydomain";

var CompanyDomainModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];

		if (!attrs.host || (attrs.host == '')) {
			errors.push("O host é obrigatório.");
		}
		if (!attrs.baseUrl || (attrs.baseUrl == '')) {
			errors.push("A URL base é obrigatório.");
		}
		if (!attrs.theme || (attrs.theme == '')) {
			errors.push("O tema é obrigatório.");
		}
		if (!attrs.company || !attrs.company.id || (attrs.company.id == '')) {
			errors.push("A instituição é obrigatório.");
		}

		if (errors.length > 0)
			return errors;
	}
});

var CompanyDomainStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'companydomain-create',
	ACTION_DESTROY: 'companydomain-destroy',
	ACTION_FIND: 'companydomain-find',
	ACTION_RETRIEVE: 'companydomain-retrieve',
	ACTION_UPDATE: 'companydomain-update',
	ACTION_SAVE: 'companydomain-save',
	ACTION_LIST_DOMAINS: 'companydomain-listDomains',
	ACTION_REMOVE_DOMAIN: 'companydomain-removeDomain',
	dispatchAcceptRegex: /^companydomain-[a-zA-Z0-9]+$/,

	url: URL,
	model: CompanyDomainModel,

	removeDomain(id) {
		var me = this;
		$.ajax({
			method: "DELETE",
			url: me.url+"/"+id,
			dataType: 'json',
			success(data) {
				me.trigger("domain-removed", data);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	update(data, opts) {
		var me = this;
		$.ajax({
			method: "PUT",
			url: me.url,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				domain: data,
			}),
			success(data) {
				me.trigger("domain-updated", data, opts);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			},
		});
	},

	create(data) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				domain: data
			}),
			success(model) {
				me.trigger("domain-created", model,{});
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	listDomains(data) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("domains-listed", model, data);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	}
});

export default new CompanyDomainStore();
