
import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

import { FULL_PAGE_SIZE } from 'forpdi/src/consts';

var URL = Fluxbone.BACKEND_URL+"company";

var CompanyModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];

		if (!attrs.name || (attrs.name == '')) {
			errors.push("O nome da instituição é obrigatório.");
		}

		if (errors.length > 0)
			return errors;
	}
});

var CompanyStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'company-create',
	ACTION_DESTROY: 'company-destroy',
	ACTION_FIND: 'company-find',
	ACTION_RETRIEVE: 'company-retrieve',
	ACTION_UPDATE: 'company-update',
	ACTION_UPDATE_LOGO: 'company-updateLogo',
	ACTION_FIND_THEMES: 'company-findThemes',
	ACTION_REMOVE_COMPANY:'company-removeCompany',
	ACTION_LIST_COMPANIES: 'company-listCompanies',
	dispatchAcceptRegex: /^company-[a-zA-Z0-9]+$/,

	url: URL,
	model: CompanyModel,

	create(data) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				company: data
			}),
			success(data) {
				me.trigger("create", data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	update(data) {
		var me = this;
		$.ajax({
			method: "PUT",
			url: me.url,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				company: data
			}),
			success(data) {
				me.trigger("update", data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateLogo(data) {
		var me = this;
		$.ajax({
			method: "PUT",
			url: me.url + '/update-logo',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(data) {
				me.trigger("logo-updated", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	removeCompany(id) {
		var me = this;
		$.ajax({
			method: "DELETE",
			url: me.url+"/"+id,
			dataType: 'json',
			success(data) {
				me.trigger("remove", data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findThemes(data) {
		var me = this;
		if (typeof me._themes === 'undefined') {
			$.ajax({
				url: me.url+"/themes",
				method: 'GET',
				dataType: 'json',
				success(data) {
					me._themes = data;
					me.trigger("themes", me._themes);
				}
			});
		} else {
			_.defer(() => {
				me.trigger("themes", me._themes);
			});
		}
	},

	listCompanies(data = { page: 1, pageSize: FULL_PAGE_SIZE }) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("companies-listed", model, data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	}
});

export default new CompanyStore();
