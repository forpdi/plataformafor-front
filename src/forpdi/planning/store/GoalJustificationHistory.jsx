import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"goals-justification";

var GoalJustificationHistoryStore = Fluxbone.Store.extend({
	ACTION_LIST_GOALS_JUSTIFICATION_HISTORY: "goalsJustificationHistory-listGoalsJustificationHistory",
	dispatchAcceptRegex: /^goalsJustificationHistory-[a-zA-Z0-9]+$/,

	url: URL,

	listGoalsJustificationHistory(structureLevelId) {
		var me = this;
		$.ajax({
			url: `${me.url}/list/${structureLevelId}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("goalsJustificationHistoryListed", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	}

});

export default new GoalJustificationHistoryStore();
