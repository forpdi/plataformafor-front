import _ from "underscore";
import React from "react";
import Backbone from "backbone";
import {Dispatcher} from "flux";
import string from 'string';
import Toastr from 'toastr';
import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import moment from "moment";

Toastr.options.positionClass = "toast-top-full-width";
Toastr.options.timeOut = 3000;
Toastr.options.extendedTimeOut = 1000;

let refreshTokenTimeout
const anticipationOnRefreshingMs = 20000

var UserSession = Backbone.Model.extend({
	ACTION_REFRESH: 'refreshStatus',
	ACTION_LOGIN: 'login',
	ACTION_LOGOUT: 'logout',
	ACTION_RECOVER_PASSWORD: 'recoverPassword',
	ACTION_CHECK_REGISTER_TOKEN: 'checkRegisterToken',
	ACTION_REGISTER_USER: 'registerUser',
	ACTION_REGISTER_TERMS: 'registerTerms',
	ACTION_CHECK_RECOVER_TOKEN: 'checkRecoverToken',
	ACTION_RESET_PASSWORD: 'resetPassword',
	ACTION_UPDATE_PROFILE: 'updateProfile',
	ACTION_LIST_NOTIFICATIONS: 'listNotifications',
	ACTION_SET_NOTIFICATIONS_VISUALIZED: 'setNotificationsVisualized',
	ACTION_DELETE_NOTIFICATIONS: 'deleteNotifications',
	ACTION_SET_NOTIFICATION_DELETED :'setNotificationDeleted',
	ACTION_SET_NOTIFICATION_RESPONDED :'setNotificationResponded',
	ACTION_SEND_MESSAGE:'sendMessage',
	ACTION_LIST_MESSAGES:'listMessages',
	ACTION_GET_MESSAGE_BY_NOTIFICATION_ID:'getMessageNotification',

	BACKEND_URL: BACKEND_URL,
	url: BACKEND_URL + "user",
	$dispatcher: new Dispatcher(),
	dispatch(payload) {
		this.$dispatcher.dispatch(payload);
	},
	dispatchCallback(payload) {
		if (payload.action) {
			var method = this[payload.action];
			if (typeof method === 'function') {
				method.call(this, payload.data);
			} else {
				console.warn("UserSession: The action (method)",payload.action,"is not defined.");
			}
		} else {
			console.warn("UserSession: The dispatching action must be defined.\n",payload);
		}
	},
	initialize() {
		this.dispatchToken = this.$dispatcher.register(this.dispatchCallback.bind(this));
		const refreshToken = localStorage.getItem("refresh-token")
		if (refreshToken) {
			this.set({loading: true});
			this.refreshStatus(refreshToken);
		} else {
			this.set({loading: false});
		}
	},
	contextTypes: {
		toastr: React.PropTypes.object.isRequired
	},
	parse(response, opts) {
		return response.data ? {
			logged: true,
			user: response.data.user,
			accessLevel: response.data.accessLevel,
			permissions: response.data.permissions
		}:{
			logged: false
		};
	},

	refreshStatus(refreshToken) {
		var me = this;
		$.ajax({
			method: "GET",
			url: BACKEND_URL + "auth/refresh-access-token",
			dataType: 'json',
			beforeSend: request => me.setRefreshTokenHeader(request, refreshToken),
			success(data) {
				if (data.success) {
					const { token, refreshToken } = data.data
					me.setupAccessToken(token, refreshToken);
					me.set({
						"logged": true,
						"user": data.data.user,
						"accessLevel": data.data.accessLevel,
						"permissions": data.data.permissions,
						"termsAcceptance": data.data.termsAcceptance,
					});
					me.trigger("login", me);
				} else {
					me.trigger("fail", data.message);
				}
				if (me.get("loading")) {
					me.set({loading: false});
					me.trigger("loaded", true);
				}
			},
			error(opts, status, errorMsg) {
				if (me.get("loading")) {
					me.set({loading: false});
					me.trigger("loaded", true);
				}
				me.clearStorage();
				location.assign("#/");
			}
		});
	},

	handleRequestErrors(collection, opts) {
		if (opts.status == 400) {
			this.trigger("fail", opts.responseJSON.message);
		} else if (opts.status == 409) {
			// Validation errors
			try {
				var resp = JSON.parse(opts.responseText);
			} catch (err) {
				resp = {
					message: "Unexpected server error "+opts.status+" "+opts.statusText+": "+opts.responseText
				};
			}
			this.trigger("fail", resp.message);
		} else {
			console.error(opts.responseText);
			if (opts.responseJSON && opts.responseJSON.message) {
				this.trigger("fail", opts.responseJSON.message);
			} else {
				this.trigger("fail", `Unexpected server error: ${opts.status} ${opts.statusText}`);
			}
		}
	},

	login({ data, captchaToken }) {
		var me = this,
			errors = [];

		if ((!(data.email) || (data.email == '') && (!(data.password) || (data.password == '')))) {
			errors.push("Por favor, digite seu nome de usuário e sua senha");
		}
		else {
			if (!(data.email) || (data.email == '')) {
				errors.push("Por favor, digite seu nome de usuário");
			}
			if (!(data.password) || (data.password == '')) {
				errors.push("Por favor, digite sua senha");
			}
		}

		if (errors.length > 0) {
			me.trigger("fail", errors);
		} else {
			$.ajax({
				method: "POST",
				url: BACKEND_URL + "auth/login",
				dataType: 'json',
				data: JSON.stringify(data),
				contentType: 'application/json',
				processData: false,
				beforeSend: function(request) {
					request.setRequestHeader("Captcha-Token", captchaToken);
				},
				success(data) {
					if (data.success) {
						const { token, refreshToken } = data.data
						me.setupRefreshToken(refreshToken)
						me.setupAccessToken(token, refreshToken);
						me.set({
							"logged": true,
							"user": data.data.user,
							"accessLevel": data.data.accessLevel,
							"permissions": data.data.permissions,
							"termsAcceptance": data.data.termsAcceptance,
						});
						me.trigger("login", me);
					} else {
						me.trigger("fail", data.message);
					}
				},
				error(opts, status, errorMsg) {
					me.handleRequestErrors([], opts);
					grecaptcha.reset();
				}
			});
		}
	},

	logout(reloadPage) {
		const me = this;
		this.set({logged: false, user: null});
		$.ajax({
			method: "GET",
			url: BACKEND_URL + "auth/logout",
			contentType: 'application/json',
			beforeSend: request => me.setRefreshTokenHeader(request, localStorage.getItem("refresh-token")),
			success(data) {
				if (data.success) {
					$.ajaxSetup({
						headers: {
							"Authorization": null
						}
					});
					me.clearStorage();
					clearTimeout(refreshTokenTimeout)
					me.trigger("logout");
					if (reloadPage) {
						location.reload();
					} else {
						location.assign("#/");
					}
				}
			},
			error(opts) {
				me.handleRequestErrors([], opts);
				grecaptcha.reset();
			}
		});
	},

	recoverPassword(params) {
		var me = this;
		$.ajax({
			method: "POST",
			url: BACKEND_URL + "user/recover",
			dataType: 'json',
			data: JSON.stringify(params),
			contentType: 'application/json',
			processData: false,
			success(data, status, opts) {
				me.trigger("recoverpassword", data);
			},
			error(opts, status, errorMsg) {
				me.trigger("recoverpassword", opts.responseJSON);
			}
		});
	},

	checkRegisterToken(token) {
		var me = this;
		if (typeof token !== 'string') {
			console.warn("UserSession: You must provide a string token to be checked.\n",token);
			return;
		}
		$.ajax({
			method: "GET",
			url: BACKEND_URL + "user/register/"+token,
			dataType: 'json',
			success(data, status, opts) {
				me.trigger("registertoken", true);
			},
			error(opts, status, errorMsg) {
				me.trigger("registertoken", false);
			}
		});
	},
	registerUser(params) {
		var me = this,
			errors = []
		;

		if (string(params.name).isEmpty()) {
			errors.push("O nome é obrigatório.");
		}
		if (string(params.cpf).isEmpty()) {
			errors.push("O CPF é obrigatório.");
		}
		if (string(params.cellphone).isEmpty()) {
			errors.push("O celular é obrigatório.");
		}
		// if (string(params.birthdate).isEmpty()) {
		// 	errors.push("A data de nascimento é obrigatória.");
		// }

		if (string(params.password).isEmpty()) {
			errors.push("A senha é obrigatória.");
		} else if (params.password !== params.passwordconfirm) {
			errors.push("As senhas digitadas não são iguais.");
		}

		if (errors.length > 0) {
			me.trigger("fail", errors);
			return;
		}

		var token = params.token;
		var termsAccepted = params.termsAccepted;
		delete params.token;
		$.ajax({
			method: "POST",
			url: BACKEND_URL + "user/register/"+token,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				user: params,
				termsAccepted,
			}),
			contentType: 'application/json',
			processData: false,
			success(data, status, opts) {
				me.trigger("register", data);
			},
			error(opts, status, errorMsg) {
				var error = JSON.parse(opts.responseText);
				if (error.message == "CPF ") {
					Toastr.remove();
					Toastr.error("CPF já cadastrado no sistema. Insira um CPF válido.");
					//me.trigger("fail", "CPF já cadastrado no sistema. Insira um CPF válido");
				} else if (error.message == "CPF CELULAR") {
					Toastr.remove();
					Toastr.error("CPF e Celular já cadastrados no sistema. Insira valores válidos");
					//me.trigger("fail", "CPF e Celular já cadastrados no sistema. Insira valores válidos");
				} else if (error.message == "CELULAR") {
					Toastr.remove();
					Toastr.error("Celular já cadastrado no sistema. Insira um número válido");
					//me.trigger("fail", "Celular já cadastrado no sistema. Insira um número válido");
				} else {
					me.handleRequestErrors([], opts);
				}
			}
		});
	},
	registerTerms(params) {
		var me = this,
			errors = []
		;
		if (errors.length > 0) {
			me.trigger("fail", errors);
			return;
		}

		$.ajax({
			method: "POST",
			url: BACKEND_URL + "user/update/terms",
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				id: params.id,
			}),
			contentType: 'application/json',
			processData: false,
			success(data, status, opts) {
				me.trigger("registerTerms", data);
			},
			error(opts, status, errorMsg) {
				var error = JSON.parse(opts.responseText);
				me.handleRequestErrors([], opts);
			}
		});
	},

	checkRecoverToken(token) {
		var me = this;
		if (typeof token !== 'string') {
			console.warn("UserSession: You must provide a string token to be checked.\n",token);
			return;
		}
		$.ajax({
			method: "GET",
			url: BACKEND_URL + "user/reset/"+token,
			dataType: 'json',
			success(data, status, opts) {
				me.trigger("recovertoken", true);
			},
			error(opts, status, errorMsg) {
				me.trigger("recovertoken", false);
			}
		});
	},
	resetPassword(params) {
		var me = this;
		if (params.password !== params.passwordconfirm) {
			me.trigger("fail", "As senhas digitadas não são iguais.");
			return;
		}
		$.ajax({
			method: "POST",
			url: BACKEND_URL + "user/reset/"+params.token,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				password: params.password
			}),
			contentType: 'application/json',
			processData: false,
			success(data, status, opts) {
				me.trigger("resetpassword", data);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listNotifications(data){
		var me = this;
		$.ajax({
			url:  BACKEND_URL + "notification/notifications",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				if (data && data.visualized === false)
					me.trigger("retrieve-limitedNotifications", model);
				else if (data && data.page)
					me.trigger("retrieve-showMoreNotifications", model);
				else
					me.trigger("retrieve-notifications", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	setNotificationsVisualized(data){
		var me = this;
		$.ajax({
			url:  BACKEND_URL + "notification/setlistvisualized",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success(model) {
				if (data)
					me.trigger("set-notifications-visualized", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	deleteNotifications(data){
		var me = this;
		$.ajax({
			url:  BACKEND_URL + "notification/deleteNotifications",
			method: 'GET',
			dataType: 'json',
			contentType: 'json',
			data: data,
			success(model) {
				me.trigger("notificationsDeleted", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	sendMessage(data){
		var me = this;
		$.ajax({
			url:  BACKEND_URL + "structure/sendmessage",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				subject: data.subject,
				message: data.message,
				userId: data.userId
			}),
			success(response) {
				me.trigger("sendMessage",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	listMessages(data){
		var me = this;
		$.ajax({
			url: BACKEND_URL +"structure/listmessages",
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success(model) {
				me.trigger("retrieve-messages", model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	getMessageNotification(notificationId, actionName){
		var me = this;
		$.ajax({
			url: BACKEND_URL +"structure/get-message-by-notification-id/"+ notificationId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success(model) {
				me.trigger('retrieve-message-by-notificationID', model);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	setNotificationResponded(notificationId){
		var me = this;
		$.ajax({
			url:  BACKEND_URL + "structure/setresponded",
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({
				notificationId,
			}),
			success(response) {
				me.trigger("setResponded",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
	}
		});
	},

	setNotificationDeleted({ notificationId }){
		var me = this;
		$.ajax({
			url:  `${BACKEND_URL}notification/${notificationId}`,
			method: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success(response) {
				me.trigger("setNotificationDeleted",response);
			},
			error(opts, status, errorMsg) {
				me.handleRequestErrors([], opts);
			}
		});
	},

	setupAccessToken(token, refreshToken) {
		Cookies.set('jwt-token', token, { secure: true });
		$.ajaxSetup({
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		this.setupRefreshTimeout(token, refreshToken)
	},

	setupRefreshTimeout(accessToken, refreshToken) {
		const tokenDecoded = jwt_decode(accessToken);
		const exp = moment.unix(tokenDecoded.exp)
		const now = moment()
		const millisecToExpire = (exp.unix() - now.unix()) * 1000
		refreshTokenTimeout = setTimeout(
			() => this.refreshStatus(refreshToken),
			millisecToExpire - anticipationOnRefreshingMs)
	},

	setupRefreshToken(refreshToken) {
		localStorage.setItem("refresh-token", refreshToken)
	},

	clearStorage() {
		localStorage.removeItem("refresh-token");
		Cookies.remove('jwt-token');
	},

	setLastVisualizedVersion() {
		localStorage.setItem('lastVersionVisualized', EnvInfo.buildVersion);
	},

	clearLastVisualizedVersion() {
		localStorage.removeItem('lastVersionVisualized');
	},

	setRefreshTokenHeader(request, refreshToken) {
		request.setRequestHeader("Refresh-token", `Bearer ${refreshToken}`);
	}
});

export default new UserSession();