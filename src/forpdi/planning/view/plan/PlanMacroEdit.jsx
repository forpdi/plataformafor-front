
import React from "react";
import {Link} from 'react-router';

import _ from 'underscore';
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx"

import Form from "forpdi/src/forpdi/core/widget/form/Form.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";

import Messages from "forpdi/src/Messages.jsx";

import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import moment from 'moment';
//import Toastr from 'toastr';

var VerticalForm = Form.VerticalForm;
var Validate = Validation.validate;

export default React.createClass({
	contextTypes: {
		router: React.PropTypes.object,
		tabPanel: React.PropTypes.object,
		roles: React.PropTypes.object.isRequired,
		toastr: React.PropTypes.object.isRequired
	},
	getInitialState() {
		return {
			loading: !!this.props.params.id,
			modelId: this.props.params.id,
			model: null,
			fields: this.getFields()
		};
	},
	getFields(model) {
		return [{
			name: "name",
			type: "text",
			required: true,
			maxLength:240,
			placeholder: "",
			label: Messages.getEditable("label.name","fpdi-nav-label"),
			value: model ? model.get("name"):null
		},{
			name: "begin",
			type: "date",
			required: true,
			placeholder: "",
			label: Messages.get("label.dateBegin"),
			onChange:this.onStartDateChange,
			value: model ? model.get("begin"):null
		},{
			name: "end",
			type: "date",
			required: true,
			placeholder: "",
			label: Messages.get("label.dateEnd"),
			onChange:this.onEndDateChange,
			value: model ? model.get("end"):null
		},{
			name: "description",
			type: "textarea",
			placeholder: "",
			maxLength:9900,
			label: Messages.getEditable("label.descriptionPlan","fpdi-nav-label"),
			value: model ? model.get("description"):null

		},{
			name: "documented",
			type: "checkbox",
			placeholder: "",
			required:true,
			label: Messages.get("label.useDocumentPdi"),
			value: model ? model.get("documented") : true
		}
		/* IMPORTAR ESTRUTURA DO PLANO NÃO ESTÁ IMPLEMENTADO
		,{
			name: "document",
			type: "upload",
			required: true,
			maxLength:255,
			placeholder: "Importar estrutura",
			label: "documento",
			value: null,
			extraFunction: this.importStructure

		}*/];
	},
	onStartDateChange(data){
		var model = this.state.model;
		this.setState({
			model:model,
		});
		this.refs.planMacroEditForm.refs.begin.props.fieldDef.value = data.format('DD/MM/YYYY');
	},
	onEndDateChange(data){
		var model = this.state.model;
		this.setState({
			model:model,
		});
		this.refs.planMacroEditForm.refs.end.props.fieldDef.value = data.format('DD/MM/YYYY');
	},

	importStructure(evt) {
		evt.preventDefault();
		Modal.uploadFile(
			Messages.get("label.importEstructure"),
			<p>{Messages.get("label.uploadXml")}</p>,
			StructureStore.url+"/import",
			"text/xml",
			(response) => {
				//console.log(response);
			},
			null,
			"xml."
		);
	},

	updateLoadingState() {
		this.setState({
			fields: this.getFields(this.state.model),
			loading: (this.props.params.id && !this.state.model)
		});
	},
	componentDidMount() {
		var me = this;
		// if (!me.context.roles.ADMIN) {
		// 	me.context.router.replace("/home");
		// 	return;
		// }
		PlanMacroStore.on("planMacroUpdated", (model) => {
			//Toastr.remove();
			if(this.props.params.id){
				//Toastr.success("Plano editado com sucesso");
				this.context.toastr.addAlertSuccess(Messages.get("label.success.planEdit"));
				me.context.router.push("/plan/"+model.data.id+"/details/");
			}
			else{
			    //Toastr.success("Plano criado com sucesso");

				PlanMacroStore.dispatch({
            		action: PlanMacroStore.ACTION_FIND_UNARCHIVED
        		});

        		PlanMacroStore.dispatch({
           			action: PlanMacroStore.ACTION_FIND_ARCHIVED
        		});

				this.context.toastr.addAlertSuccess(Messages.get("label.success.planCreate"));
				me.context.router.push("/plan/"+model.get("id")+"/document/");
			}
		}, me);
		PlanMacroStore.on("retrieve", (model) => {
			console.log('[PlanMacroEdit] Retrieved model:', model);
			me.setState({
				model: model
			}, () => {
				me.updateLoadingState();
			});
		}, me);

		PlanMacroStore.on("fail", (msg) => {
			console.log('[PlanMacroEdit] Failed:', msg);
			me.setState({ loading: false });
		}, me);

		PlanMacroStore.on("planmacrocreated", (model) => {
            PlanMacroStore.dispatch({
                action: PlanMacroStore.ACTION_FIND_UNARCHIVED
            });

            PlanMacroStore.dispatch({
                action: PlanMacroStore.ACTION_FIND_ARCHIVED
            });
            this.context.toastr.addAlertSuccess(Messages.get("label.success.planCreate"));
            me.context.router.push("/plan/"+model.data.id+"/details/");
        }, me);

		if (this.props.params.id) {
			_.defer(() => {
				if (me.context.tabPanel) {
					me.context.tabPanel.addTab(me.props.location.pathname, Messages.get("label.editPlanMacro"));
				}
			});
			console.log('[PlanMacroEdit] Fetching plan with ID:', this.state.modelId);
			PlanMacroStore.dispatch({
				action: PlanMacroStore.ACTION_RETRIEVE,
				data: this.state.modelId
			});
		} else {
			console.log('[PlanMacroEdit] No ID provided, showing new plan form');
		}
	},
	componentWillUnmount() {
		PlanMacroStore.off(null, null, this);
	},

	refreshCancel () {
		Modal.hide();
	},

  onCancel(){
    var me = this;

    const msg = Messages.get("label.msg.CancelPlanMacroEdit");
    const { modelId } = me.state;
	const isEditing = !!modelId;

    Modal.confirmCustom(() => {
      this.refreshCancel();
	  if (isEditing){
      me.context.router.push("/plan/"+modelId+"/details/");
      this.context.toastr.addAlertSuccess(Messages.get("label.msg.PlanMacroEditCanceled"));
	  }else{
		me.context.router.push("/home");
	  }
    }, msg, this.refreshCancel);
  },

	onSubmit(data) {
		var me = this;

		var validation = Validate.validationPlanMacroEdit(data, this.refs.planMacroEditForm);

		if(validation.boolMsg){
			//Toastr.remove();
			//Toastr.error(msg);
			this.context.toastr.addAlertError(validation.msg);
			return;
		}

		if (me.props.params.id) {
			var oldBeginDate = moment(me.state.model.attributes.begin,"DD/MM/YYYY").toDate(); // data início que estava no banco
			var oldEndDate = moment(me.state.model.attributes.end,"DD/MM/YYYY").toDate(); // data fim que estava no banco

			var newBeginDate = moment(data.begin,"D/M/YYYY").toDate(); // data início nova
			var newEndDate = moment(data.end,"D/M/YYYY").toDate(); // data fim nova
			var msg = "";
			if(oldEndDate > newEndDate || oldEndDate < newEndDate || oldBeginDate > newBeginDate || oldBeginDate < newBeginDate){ // se houver alguma alteração de datas
				msg = Messages.get("label.msg.changeDate");
			}else{
				msg = Messages.get("label.msgUpdate");
			}


			Modal.confirmCustom(() => {
				me.state.model.set(data);
        const plan = me.state.model.attributes;
				Modal.hide();
				PlanMacroStore.dispatch({
					action: PlanMacroStore.ACTION_CUSTOM_UPDATE,
					data: plan
				});
			},msg,this.refreshCancel);
		} else {
			var msg = Messages.get("label.msg.planMacroCreate");
			Modal.confirmCustom(() => {
				Modal.hide();
				PlanMacroStore.dispatch({
					action: PlanMacroStore.ACTION_NEWPLAN,
					data: data,
					opts: {
						wait: true
					}
				});
			},msg,this.refreshCancel);
		}

		/*if (me.props.params.id) {
			me.state.model.set(data);
			PlanMacroStore.dispatch({
				action: PlanMacroStore.ACTION_UPDATE,
				data: me.state.model
			});
		} else {
			PlanMacroStore.dispatch({
				action: PlanMacroStore.ACTION_CREATE,
				data: data,
				opts: {
					wait: true
				}
			});
		}*/
	},

	render() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		return <div>
			<h3 style={{
				color: '#293a59',
				fontWeight: '600',
				fontSize: '26px',
				marginBottom: '30px',
				marginLeft: '115px'
			}}>{this.props.params.id ? Messages.getEditable("label.editPlan", "fpdi-nav-label") : Messages.getEditable("label.newPlan", "fpdi-nav-label")}</h3>
			<div className="fpdi-card padding40">

					<VerticalForm
					  ref="planMacroEditForm"
						onSubmit={this.onSubmit}
            onCancel={this.onCancel}
						fields={this.state.fields}
						store={PlanMacroStore}
						submitLabel={Messages.get("label.submitLabel")}
					/>
				</div>
			</div>;
	}
});
