import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"communication";

var VersionModel = Fluxbone.Model.extend({
	url: URL,
});

var CommunicationStore = Fluxbone.Store.extend({
	ACTION_NEW_COMMUNICATION: 'communication-newCommunication',
	ACTION_RETRIEVE: 'communication-retrieve',
	ACTION_SHOW_COMMUNICATION: 'communication-showCommunication',
	ACTION_COMPARE_VALIDATION: 'communication-compareCommunicationValidity',
	ACTION_UPDATE_COMMUNICATION: 'communication-updateCommunication',
	ACTION_LIST_COMMUNICATIONS: 'communication-listCommunications',
	ACTION_END_COMMUNICATION: 'communication-endCommunication',
	dispatchAcceptRegex: /^communication-[a-zA-Z0-9]+$/,

	url: URL,
	model: VersionModel,

  newCommunication(data) {
		var me = this;
		$.ajax({
			url: me.url + '/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				title: data.title,
				message: data.message,
				validityBegin: data.validityBegin,
				validityEnd: data.validityEnd,
			}),
			success(model) {
				me.trigger("communicationCreated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
  },
	
	setLastVisualizedCommunication(communication) {
		localStorage.setItem('lastCommunicationVisualized', communication.id);
	},
	clearLastVisualizedCommunication() {
		localStorage.removeItem('lastCommunicationVisualized');
	},

  updateCommunication(data) {
		var me = this;
		$.ajax({
			url: me.url + '/update',
			method: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({...data}),
			success(model) {
				me.trigger("communicationUpdated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listCommunications(data) {
		var me = this;
		$.ajax({
			url: me.url + "/list",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("communicationsListed", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("listCommunicationsError", opts);
			}
		});
	},

	showCommunication(data) {
		var me = this;
		$.ajax({
			url: me.url + "/showActiveCommunication",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("communicationPopupRetrieved", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("showCommunicationError", opts);
			}
		});
	},

	compareCommunicationValidity(data) {
		var me = this;
		$.ajax({
			url: me.url + "/retrieveActiveCommunication",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("communicationValidityVerified", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("showCommunicationError", opts);
			}
		});
	},

	endCommunication(data) {
		var me = this;
		$.ajax({
			url: me.url + '/' + data,
			method: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger("communicationClosed", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

});

export default new CommunicationStore();
