import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"item";

var ItemModel = Fluxbone.Model.extend({
	url: URL,
});

var ItemStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'item-create',
	ACTION_CREATE_FIELD: 'item-createField',
	ACTION_NEW_ITEM: 'item-newItem',
	ACTION_DESTROY: 'item-destroy',
	ACTION_FIND: 'item-find',
	ACTION_FIND_TERMS:'item-findTerms',
	ACTION_RETRIEVE_ITEM: 'item-retrieveItem',
	ACTION_RETRIEVE_ITEMS: 'item-retrieveItems',
	ACTION_RETRIEVE_FIELD: 'item-retrieveField',
	ACTION_RETRIEVE_PERFORMANCE: 'item-retrievePerformance',
	ACTION_UPDATE: 'item-update',
	ACTION_CUSTOM_UPDATE: 'item-customUpdate',
	ACTION_DELETE_PLAN: 'item-deleteItem',
	ACTION_DELETE: "item-delete",
	ACTION_RETRIEVE_SUBITEM: "item-retrieveSubitem",
	ACTION_RETRIEVE_SUBITEMS: "item-retrieveSubitems",
	ACTION_RETRIEVE_ALLSUBITEMS: "item-retrieveAllSubitems",
	ACTION_NEW_SUBITEM: 'item-newSubItem',
	ACTION_CREATE_SUBFIELD: 'item-createSubfield',
	ACTION_RETRIEVE_SUBFIELD: 'item-retrieveSubField',
	ACTION_DELETE_SUB: 'item-deleteSubitem',
	ACTION_CUSTOM_UPDATE_SUB: 'item-customUpdateSub',
	dispatchAcceptRegex: /^item-[a-zA-Z0-9]+$/,
	url: URL,
	model: ItemModel,


	newItem(data) {
		var me = this;
		$.ajax({
			url: me.url+"/new",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				item: data
			}),
			success(model) {
				me.trigger("newItem", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	newSubItem(data) {
		var me = this;
		$.ajax({
			url: me.url+"/subnew",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				subitem: data
			}),
			success(model) {
				me.trigger("newSubItem", model);

			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	retrieveItem(id) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/" + id,
			success(model, response, options) {
				me.trigger("retrieveItem", model);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	retrieveItems(id) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url,
			data: {policyId: id},
			success(model, response, options) {
				me.trigger("retrieveItems", response);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	retrieveSubitem(id) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/subitem/" + id,
			success(model, response, options) {
				me.trigger("retrieveSubitem", response);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	retrieveSubitems(id,pigback) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/subitens/" + id,
			success(model, response, options) {
				me.trigger("retrieveSubitems", response,pigback);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	retrieveAllSubitems(id,pigback) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/allsubitens/" + id,
			success(model, response, options) {
				me.trigger("retrieveAllSubitems", response,pigback);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	createField(data) {
		var me = this;
		$.ajax({
			url: me.url+"/field",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				fieldItem: data
			}),
			success(model) {
				me.trigger("itemField", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	createSubfield(data) {
		var me = this;
		$.ajax({
			url: me.url+"/subfield",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				fieldSubItem: data
			}),
			success(model) {
				me.trigger("itemField", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	retrieveField(id) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/field/" + id,
			success(model, response, options) {
				me.trigger("retrieveField", model);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	retrieveSubField(id) {
		var me = this;
		var model = new me.model();
		model.fetch({
			url: me.url + "/subfield/" + id,
			success(model, response, options) {
				me.trigger("retrieveSubField", response);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
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
				item: data
			}),
			success(model) {
				me.trigger("itemUpdated", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	customUpdateSub(data) {
		var me = this;
		$.ajax({
			url: me.url+"/subitem/update",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				subitem: data
			}),
			success(model) {
				me.trigger("subitemUpdated", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	findTerms(data) {
		var me = this;
		$.ajax({
			url: me.url+"/findTerms",
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("itemFind", model, data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	retrievePerformance(params) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url+"/performance",
			dataType: 'json',
			data: params,
			success(response, status, opts) {
				me.trigger("retrieve-performance", response.data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},


	delete(data){
		var me = this;
		$.ajax({
			url: me.url+"/"+data,
			method: 'DELETE',
			success(model) {
				me.trigger("itemDeleted", model, data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},


	deleteSubitem(data){
		var me = this;
		$.ajax({
			url: me.url+"/subitem/"+data,
			method: 'DELETE',
			success(model) {
				me.trigger("subitemDeleted", model, data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

});

export default new ItemStore();
