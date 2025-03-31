import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL + "access-log";

var AccessLogStore = Fluxbone.Store.extend({
	FPDI_ACCESS: 'access-log-fpdiAccess',
  FRISCO_ACCESS: 'access-log-friscoAccess',
	dispatchAcceptRegex: /^access-log-[a-zA-Z0-9]+$/,
	url: URL,

	fpdiAccess() {
		var me = this;
		$.ajax({
			url: me.url+"/fpdi-access",
			method: 'GET',
			contentType: 'application/json',
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

  friscoAccess() {
		var me = this;
		$.ajax({
			url: me.url+"/frisco-access",
			method: 'GET',
			contentType: 'application/json',
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},
});

export default new AccessLogStore();
