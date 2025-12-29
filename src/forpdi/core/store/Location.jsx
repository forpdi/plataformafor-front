import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL + "location";

var LocationStore = Fluxbone.Store.extend({
	ACTION_LIST_UFS: 'location-listUfs',
  ACTION_LIST_COUNTIES: 'location-listCounties',
	dispatchAcceptRegex: /^location-[a-zA-Z0-9]+$/,

	url: URL,

	listUfs() {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/ufs",
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("ufs-listed", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	listCounties(ufId) {
		var me = this;
		$.ajax({
			method: "GET",
			url: `${me.url}/counties/${ufId}`,
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("counties-listed", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},
});

export default new LocationStore();
