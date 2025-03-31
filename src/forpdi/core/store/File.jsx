import Fluxbone from "forpdi/src/forpdi/core/store/Fluxbone.jsx";

var URL = Fluxbone.BACKEND_URL + "file";

var FileModel = Fluxbone.Model.extend({
	url: URL,
	validate(attrs, options) {
		var errors = [];

		if (errors.length > 0)
			return errors;
	}
});


var FileStore = Fluxbone.Store.extend({
	ACTION_CREATE: 'file-create',
	ACTION_FIND: 'file-find',
	ACTION_DESTROY: 'file-destroy',
	ACTION_RETRIEVE: 'file-retrieve',
	ACTION_UPLOAD: 'file-upload',
	dispatchAcceptRegex: /^file-[a-zA-Z0-9]+$/,

	url: URL,
	model: FileModel,

	upload(data) {
		const { file, onProgressHandler } = data;
    var me = this;
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
        method: "POST",
        url: URL + "/upload",
        dataType: 'json',
        processData: false,
        contentType: false,
        data: formData,
        success(data, status, opts) {
            if (data.success) {
                me.trigger("uploaded", data);
            } else {
                me.handleRequestErrors([], opts);
            }
        },
				xhr: () => {
					const xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener('progress', onProgressHandler, false);
					return xhr;
				},
        error(opts, status, errorMsg) {
            me.trigger("fail", data.message);
            me.handleRequestErrors([], opts);
        }
  	});
	}

});

export default new FileStore();
