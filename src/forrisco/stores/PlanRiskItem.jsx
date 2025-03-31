import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL + "planrisk/item";

var ItemModel = Fluxbone.Model.extend({
	url: URL
});

var PlanRiskItemStore = Fluxbone.Store.extend({
	ACTION_GET_ALL_ITEMS: 'planRiskItem-getAllItems',
	ACTION_GET_SUBITEMS: 'planRiskItem-getSubItems',
	ACTION_GET_SUB_ITEMS_BY_PLANRISK: 'planRiskItem-getSubItemsByPlanRisk',
	ACTION_DETAIL_ITEM: 'planRiskItem-detailItem',
	ACTION_DETAIL_SUBITEM: 'planRiskItem-detailSubItem',
	ACTION_SAVE_ITEMS: 'planRiskItem-saveNewItems',
	ACTION_ITENS_DUPLICATE: 'planRiskItem-duplicateItems',
	ACTION_SAVE_SUBITEMS: 'planRiskItem-saveNewSubItems',
	ACTION_UPDATE_ITEM: 'planRiskItem-updateItems',
	ACTION_UPDATE_SUBITEM: 'planRiskItem-updateSubitems',
	ACTION_DELETE_ITEM: 'planRiskItem-deleteItems',
	ACTION_DELETE_SUBITEM: 'planRiskItem-deleteSubItems',
	dispatchAcceptRegex: /^planRiskItem-[a-zA-Z0-9]+$/,
	url: URL,
	model: ItemModel,

	getAllItems(params) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url,
			dataType: 'json',
			data: params,
			success(data, status, opts) {
				me.trigger("allItems", data)
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	getSubItems(data, node) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/sub-itens/" + data.id,
			dataType: 'json',
			success(data, status, opts) {
				me.trigger("retrieveSubitems", data, node)
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	getSubItemsByPlanRisk(planRiskId, node) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/allsubitens/" + planRiskId.id,
			dataType: 'json',
			success(data, status, opts) {
				me.trigger("allSubItemsByPlan", data, node)
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	saveNewItems(planRiskItem) {
		var me = this;
		$.ajax({
			url: me.url + "/new",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(planRiskItem),
			success(model) {
				me.trigger("itemSaved", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},


	duplicateItems(data) {
		var me = this;
		$.ajax({
			url: me.url + "/duplicate",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				itens: data.itens,
				planRisk: data.planRisk
			}),
			success(model) {
				me.trigger("duplicatedItems", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	saveNewSubItems(planRiskSubItem) {
		var me = this;
		$.ajax({
			url: me.url + "/new/subitem",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ planRiskSubItem }),
			success(model) {
				me.trigger("subItemSaved", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	updateSubitems(planRiskSubItem) {
		var me = this;
		$.ajax({
			url: me.url + "/update-subitem",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ planRiskSubItem }),
			success(model) {
				me.trigger("subitemUpdated", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	updateItems(planRiskItem) {
		var me = this;
		$.ajax({
			url: me.url + "/update",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(planRiskItem),
			success(model) {
				me.trigger("itemUpdated", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	deleteItems(PlanRiskItemId) {
		var me = this;
		$.ajax({
			url: me.url + "/" + PlanRiskItemId,
			method: 'DELETE',
			success(model) {
				me.trigger("deletePlanRiskItem", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	deleteSubItems(PlanRiskSubItemId) {
		var me = this;
		$.ajax({
			url: me.url + "/delete-subitem/" + PlanRiskSubItemId,
			method: 'DELETE',
			success(model) {
				me.trigger("deletePlanRiskSubItem", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	detailItem(data) {
		var me = this;
		$.ajax({
			url: me.url + "/" + data.id,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("detailItem", model);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	},

	detailSubItem(data) {
		var me = this;
		$.ajax({
			url: me.url + "/subitem/" + data.id,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model, status) {
				me.trigger("detailSubItem", model, status);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		})
	}

});

export default new PlanRiskItemStore();
