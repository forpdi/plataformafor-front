import _ from 'underscore';
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL + "indicators-dashboard";

var IndicatorsDashboardStore = Fluxbone.Store.extend({
	GET_INDICATORS_DATA: 'indicators-dashboard-getIndicatorsData',
	GET_FPDI_INDICATORS: 'indicators-dashboard-getFpdiIndicators',
	GET_FRISCO_INDICATORS: 'indicators-dashboard-getFriscoIndicators',
	dispatchAcceptRegex: /^indicators-dashboard-[a-zA-Z0-9]+$/,
	url: URL,

	getIndicatorsData() {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			contentType: 'application/json',
			success(data) {
				me.trigger("indicatorsDataRetrieved", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	getFpdiIndicators() {
		var me = this;
		$.ajax({
			url: me.url+"/get-fpdi-indicators",
			method: 'GET',
			contentType: 'application/json',
			success(data) {
				me.trigger("fpdiIndicatorsRetrieved", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	getFriscoIndicators() {
		var me = this;
		$.ajax({
			url: me.url+"/get-forrisco-indicators",
			method: 'GET',
			contentType: 'application/json',
			success(data) {
				me.trigger("friscoIndicatorsRetrieved", data);
			},
			error(xhr) {
				me.handleRequestErrors([], xhr);
			}
		});
	},
});

export default new IndicatorsDashboardStore();
