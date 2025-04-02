
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL+"version";

var VersionModel = Fluxbone.Model.extend({
	url: URL,
});

var VersionStore = Fluxbone.Store.extend({
	ACTION_NEW_VERSION: 'version-newVersion',
	ACTION_RETRIEVE: 'version-retrieve',
	ACTION_UPDATE_VERSION: 'version-updateVersion',
	ACTION_LIST_VERSIONS: 'version-listVersions',
	dispatchAcceptRegex: /^version-[a-zA-Z0-9]+$/,

	url: URL,
	model: VersionModel,

  newVersion(data) {
		var me = this;
		$.ajax({
			url: me.url + '/new',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				numberVersion: data.numberVersion,
				releaseDate: data.releaseDate,
				infoFor: data.infoFor,
				infoPdi: data.infoPdi,
				infoRisco: data.infoRisco
			}),
			success(model) {
				me.trigger("versioncreated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
  },
  
  updateVersion(data) {
		var me = this;
		$.ajax({
			url: me.url + '/update',
			method: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ ...data }),
			success(model) {
				me.trigger("versionUpdated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listVersions(data) {
		var me = this;
		$.ajax({
			url: me.url + "/list",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("versionsListed", model);
			},
			error(opts, status, errorMsg) {
				me.trigger("listVersionsError", opts);
			}
		});
	},

});

export default new VersionStore();
