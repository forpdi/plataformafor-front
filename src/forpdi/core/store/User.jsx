
import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

import { FULL_PAGE_SIZE } from 'forpdi/src/consts';

var URL = Fluxbone.BACKEND_URL+"user";

var UserModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];

		if (attrs.name == undefined || attrs.name == "") {
			errors.push("O nome é obrigatório.");
		}
		if (attrs.email == undefined || attrs.email == "") {
			errors.push("O e-mail é obrigatório.");
		}

		if (errors.length > 0)
			return errors;
	}
});

var UserStore = Fluxbone.Store.extend({
	ACTION_INVITE_USER: 'user-inviteUser',
	ACTION_FIND: 'user-find',
	ACTION_FIND_USER: 'user-findUser',
	ACTION_RETRIEVE: 'user-retrieve',
	ACTION_RETRIEVE_USER: 'user-retrieveUser',
	ACTION_RETRIEVE_TO_SELECT_USER: 'user-retrieveToSelectUser',
	ACTION_REMOVE: 'user-removeFromCompany',
	ACTION_BLOCK: 'user-block',
	ACTION_UNBLOCK: 'user-unblock',
	ACTION_UPDATE_USER_PROFILE:'user-updateUserProfile',
	ACTION_UPDATE_USER:'user-updateUser',
	ACTION_UPDATE_USER_ACCESS_LEVEL:'user-updateAccessLevel',
	ACTION_UPDATE_PICTURE: 'user-updatePicture',
	ACTION_UPDATE_PICTURE_EDIT_USER: 'user-updatePictureEditUser',
	ACTION_UPDATE_FIELD: 'user-updateField',
	ACTION_RESEND_INVITATION: 'user-resendInvitation',
	ACTION_LIST_PERMISSIONS: 'user-listPermissions',
	ACTION_LIST_FILTERED_USERS: 'user-listFilteredUsers',
	ACTION_SAVE_PERMISSIONS: 'user-savePermissions',
	ACTION_USER_PROFILE: 'user-retrieveUserProfile',
	ACTION_UPDATE_NOTIFICATION_SETTINGS: 'user-updateNotificationSettings',
	ACTION_IMPORT_USERS: 'user-importUsers',
	ACTION_REGISTER: 'user-registerUser',
	dispatchAcceptRegex: /^user-[a-zA-Z0-9]+$/,

	url: URL,
	model: UserModel,

	inviteUser(data) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url + "/invite",
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({...data}),
			success(data) {
				me.trigger("invite-user", data);
			},
			error: (xhr) => {
				const msg = xhr.responseJSON ? xhr.responseJSON.message : null;
				me.trigger("invite-user-error", msg);
			}
		});
	},

	findUser(userId) {
		var me = this;
		$.ajax({
			method: "GET",
			url: me.url + "/" + userId,
			success(model, response, options) {
				me.trigger("find-user", model);
			},
			error(model, response, options) {
				me.handleRequestErrors([], options.xhr);
			}
		});
	},

	removeFromCompany(id) {
		var me = this;
		$.ajax({
			method: "DELETE",
			url: me.url+"/"+id,
			dataType: 'json',
			success(data) {
				if(data.data){
					me.remove(id);
				}
				me.trigger("remove", data);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

	block(id) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url+"/"+id+"/block",
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("block", data);
			},
			error: (model,response,opts) => {
				me.handleRequestErrors([], response);
			}
		});
	},

	unblock(id) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url+"/"+id+"/unblock",
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("unblock", data);
			},
			error: (model,response,opts) => {
				me.handleRequestErrors([], response);
			}
		});
	},

	resendInvitation(id) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url+"/"+id+"/reinvite",
			dataType: 'json',
			contentType: 'application/json',
			success(data) {
				me.trigger("resend-invitation");
			},
			error: (model,response,opts) => {
				me.handleRequestErrors([], response);
			}
		});
	},

	updateUserProfile(data){
		var me = this;
		$.ajax({
			url: me.url+"/updateUserProfile",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({...data}),
			success(response) {
				me.trigger("userUpdated",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateUser(data) {
		var me = this;
		$.ajax({
			url: me.url+"/updateUser",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({...data}),
			success(response) {
				me.trigger("userUpdated",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateAccessLevel(data) {
		var me = this;
		$.ajax({
			url: me.url+"/updateAccessLevel",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				userId: data.userId,
				accessLevel: data.accessLevel
			}),
			success(response) {
				me.trigger("editUserAccessLevel",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updatePicture(data){
		var me = this;
		$.ajax({
			url: me.url+"/picture",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				user: data.user,
				url: data.uri
			}),
			success(response) {
				me.trigger("update-picture",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updatePictureEditUser(data){
		var me = this;
		$.ajax({
			url: me.url+"/pictureEditUser",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				user: data.user,
				url: data.uri
			}),
			success(response) {
				me.trigger("update-picture-user",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveUserProfile() {
		var me = this;

		$.ajax({
			url: me.url+"/profileUser",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			success(model) {
				me.trigger("retrieve-user-profile", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveUser (data) {
		var me = this;
		$.ajax({
			url: me.url,
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data:data,
			success(model) {
				me.trigger("retrieve-user", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	retrieveToSelectUser (data) {
		var me = this;
		$.ajax({
			url: me.url + "/toSelect",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data:data,
			success(model) {
				me.trigger("retrieve-to-select-user", model);
			},
			error(opts) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listPermissions(data){
		var me = this;
		$.ajax({
			url: me.url+"/permissions",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: {
				userId: data.userId
			},
			success(model) {
				me.trigger("retrieve-permissions", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listFilteredUsers(data) {
		var me = this;
		$.ajax({
			url: me.url+"/listSystemUsers",
			method: 'GET',
			dataType: 'json',
			data: data,
			success(model) {
				me.trigger("users-filteredlist", model, data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	savePermissions(data){
		var me = this;
		$.ajax({
			url: me.url+"/permissions",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				list: data.list,
				total: data.total
			}),
			success(model) {
				me.trigger("permissions-saved", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	updateNotificationSettings(data){

		var me = this;
		$.ajax({
			url: me.url+ "/updateNotificationSettings",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: data.id,
				notificationSetting: data.notificationSetting
			}),
			success(model) {
				me.trigger("notifications-settings-updated", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	importUsers(data) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url+"/importUsers",
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				nameList: data.nameList,
				emailList: data.emailList,
				accessList: data.accessList
			}),
			success(data) {
				me.trigger("users-imported", data);
			},
			error: (model,response,opts) => {
				const msg = model.responseJSON ? model.responseJSON.message : null;
				me.trigger("fail", msg);
			}
		});
	},

	registerUser(data) {
		var me = this;
		$.ajax({
			method: "POST",
			url: me.url+"/register",
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				me.trigger("user-registred", model);
			},
			error: (xhr) => {
				me.handleRequestErrors([], xhr);
			}
		});
	},

});

export default new UserStore();
