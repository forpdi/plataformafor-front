import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"structure";

var StructureModel = Fluxbone.Model.extend({
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


var StructureStore = Fluxbone.Store.extend({
	ACTION_FIND_ATTRIBUTE_TYPES: 'structure-findAttributeTypes',
	ACTION_CREATE: 'structure-create',
	ACTION_DESTROY: 'structure-destroy',
	ACTION_FIND: 'structure-find',
	ACTION_RETRIEVE: 'structure-retrieve',
	ACTION_UPDATE: 'structure-update',
	ACTION_RETRIEVE_LEVEL_INSTANCE: 'structure-findLevelInstance',
	ACTION_RETRIEVE_LEVEL_INSTANCE_PERFORMANCE: 'structure-findLevelInstancePerformance',
	ACTION_CREATE_LEVELINSTANCE: 'structure-createLevelInstance',
	ACTION_GET_LEVELINSTANCE: 'structure-getLevelInstance',
	ACTION_DELETE_LEVELINSTANCE: 'structure-deleteLevelInstance',
	ACTION_DELETE_LEVELINSTANCE_BY_TABLE: 'structure-deleteLevelInstanceByTable',
	ACTION_RETRIEVE_LEVELATTRIBUTES: 'structure-retrieveLevelAttributes',
	ACTION_SAVE_LEVELATTRIBUTES: 'structure-saveLevelAttributes',
	ACTION_RETRIEVE_LEVELSONS: 'structure-retrieveLevelSons',
	ACTION_SET_LEVELINSTANCE_VISUALIZED: 'structure-setVisualized',
	ACTION_CLOSE_GOAL: 'structure-closeLevelGoal',
	ACTION_UPDATE_GOAL: 'structure-updateLevelGoal',
	ACTION_GOALSGENERATE: 'structure-goalsgenerate',
	ACTION_GET_AXES: 'structure-getAxes',
	ACTION_FILTER_AXES: 'structure-filterAxes',
	ACTION_GET_INDICATORS: "structure-getIndicators",
	ACTION_FILTER_INDICATORS: 'structure-filterIndicators',
	ACTION_FILTER_GOALS: 'structure-filterGoals',
	ACTION_GET_OBJECTIVES: "structure-getObjectives",
	ACTION_FILTER_OBJECTIVES: "structure-filterObjectives",
	ACTION_GET_GOALS: "structure-getGoals",
	ACTION_GET_USER_LEVELS: "structure-getUserLevels",
	ACTION_GET_FILTERED_GOALS: "structure-getFilteredGoals",
	ACTION_GET_INDICATORS_MACRO_PLAN: "structure-getIndicatorsMacroPlan",
	ACTION_GET_LEVELSONS_FILTER: "structure-getLevelSonsFilter",
	ACTION_GOALS_DELETE: "structure-deleteGoals",
	ACTION_SAVE_FAVORITE: "structure-saveFavorite",
	ACTION_REMOVE_FAVORITE: "structure-removeFavorite",
	ACTION_LIST_FAVORITES: "structure-listFavorites",
	ACTION_LIST_AGGREGATES: "structure-listAggregateIndicatorsByAggregate",
	ACTION_LIST_BY_UNIT_LINKED_TO_RISKS: "structure-listByUnitLinkedToRisks",
	ACTION_GET_INFO_TABLE: "structure-getInfoTable",
	dispatchAcceptRegex: /^structure-[a-zA-Z0-9]+$/,

	url: URL,
	model: StructureModel,

	findAttributeTypes() {
		var me = this;
		$.ajax({
			url: me.url+"/attributetypes",
			method: 'GET',
			dataType: 'json',
			success(response) {
				me.trigger("attributetypes", response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findLevelInstance(data, pigback) {
		var me = this;
		$.ajax({
			url: me.url+"/levelInstancelist",
			method: 'GET',
			data: data,
			dataType: 'json',
			success(data) {
				me.trigger("levelInstanceFind", data, pigback);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	findLevelInstancePerformance(data, pigback) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/performance",
			method: 'GET',
			data: data,
			dataType: 'json',
			success(response) {
				me.trigger("retrieve-level-instance-performance", response.data, pigback);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	createLevelInstance(data, pigback) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(response) {
				me.trigger("levelInstanceCreated", response.data, pigback);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getLevelInstance(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance",
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("levelInstanceRetrieve", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteLevelInstance(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/delete",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				levelInstance: data
			}),
			success(model) {
				me.trigger("deleteLevelInstance", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteLevelInstanceByTable(data){
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/delete",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				levelInstance: data
			}),
			success(model) {
				me.trigger("deleteLevelInstanceByTable", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveLevelAttributes(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelattributes",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("levelAttributeRetrieved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
				me.trigger("levelAttributeNoRetrieved");
			}
		});
	},

	saveLevelAttributes(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelattributes",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				levelInstance: data.levelInstance,
				url: data.url
			}),
			success(model) {
				me.trigger("levelAttributeSaved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveLevelSons(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/levelsons",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("levelSonsRetrieved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	setVisualized(levelInstanceId) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/setvisualized",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				levelInstanceId,
			}),
			success(model) {
				me.trigger("setVisualized", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	closeLevelGoal(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/closegoal",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id,
				openCloseGoal:data.openCloseGoal,
				url: String(data.url)
			}),
			success(model) {
				me.trigger("levelGoalClosed", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},


	updateLevelGoal(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/updategoal",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id,
				justification: data.justification,
				reached: data.reached
			}),
			success(model) {
				me.trigger("levelUpdate", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	goalsgenerate(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelinstance/goalsgenerate",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("goalsGenerated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getAxes(data){
		var me = this;
		$.ajax({
			url: me.url+"/axes",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("axesretrieved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	filterAxes(data, payload){
		var me = this;

		$.ajax({
			url: me.url+"/filter-axes",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("axeslisted", model, payload);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	filterIndicators(data, payload){
		var me = this;

		$.ajax({
			url: me.url+"/filter-indicators",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("indicatorslisted", model, payload);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	filterGoals(data, payload){
		var me = this;

		$.ajax({
			url: me.url+"/filter-goals",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("goalslisted", model, payload);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getIndicators(data){
		var me = this;
		$.ajax({
			url: me.url+"/indicators",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("indicatorsretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getIndicatorsMacroPlan(data){
		var me = this;
		$.ajax({
			url: me.url+"/indicatorsByMacroAndPlan",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("indicatorsByMacroAndPlanRetrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getObjectives(data){
		var me = this;
		$.ajax({
			url: me.url+"/objectives",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("objectivesretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	filterObjectives(data, payload){
		var me = this;
		$.ajax({
			url: me.url+"/filter-objectives",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("objectiveslisted", model, payload);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getGoals(data){
		var me = this;
		$.ajax({
			url: me.url+"/goals",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("goalsretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getUserLevels(data){
		var me = this;
		$.ajax({
			url: me.url+"/getuserlevels",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("userlevelsretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getFilteredGoals(data){
		var me = this;
		$.ajax({
			url: me.url+"/filtergoals",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("filteredgoalsretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getLevelSonsFilter(data) {
		var me = this;
		$.ajax({
			url: me.url+"/levelsonsfilter",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("levelSonsFilterRetrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteGoals(data){
		var me = this;
		$.ajax({
			url: me.url+"/deleteGoals",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				list: {
					list: data.list,
					total: data.total
				}
			}),
			success(model) {
				me.trigger("deletegoals", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	saveFavorite(data){
		var me = this;
		$.ajax({
			url: me.url+"/savefavorite",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("favoriteSaved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	removeFavorite(data){
		var me = this;
		$.ajax({
			url: me.url+"/removefavorite",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("favoriteRemoved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listFavorites(data){
		var me = this;
		$.ajax({
			url: me.url+"/listfavorites",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("favoritesListeds", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listAggregateIndicatorsByAggregate(data){
		var me = this;
		$.ajax({
			url: me.url+"/listaggregates",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("aggregatesListed", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listByUnitLinkedToRisks(data){
		var me = this;
		const { id } = data;
		$.ajax({
			url: me.url+"/pdi-linked-to-risk",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: { unitId: id },
			success(model) {
				me.trigger("listPdiLinkedToRisks", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getInfoTable(data){
		var me = this;
		$.ajax({
			url: me.url+"/infotable",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("infotableretrivied", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	}

});

export default new StructureStore();
