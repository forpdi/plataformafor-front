
import React from 'react';
import _ from 'underscore';
import DocumentStore from "forpdi/src/forpdi/planning/store/Document.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Messages from "forpdi/src/Messages.jsx";
import ConfirmButton from 'forpdi/src/forpdi/core/widget/form/ConfirmButton.jsx';
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import TextArea from 'forpdi/src/components/inputs/TextArea';

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired,
    planMacro: React.PropTypes.object.isRequired,
    roles: React.PropTypes.object.isRequired,
    toastr: React.PropTypes.object.isRequired,
    tabPanel: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      tabPath: this.props.location.pathname,
      document: {},
      isEditing: false,
      description: ""
    };
  },

  componentDidMount() {
    if(this.context.planMacro.get('documented')){
      DocumentStore.on("retrieve", (model) => {
        this.setState({
          loaded:true,
          document:model.get('document'),
          description:model.get('document').description
        });
        this.context.tabPanel.addTab(this.state.tabPath, model.get("document").title);
      }, this);
      this.refreshComponent(this.context.planMacro);
    } else {
      this.context.router.push("/plan/"+this.context.planMacro.get('id')+"/details");
    }
  },

  refreshComponent(planMacro){
    DocumentStore.dispatch({
      action: DocumentStore.ACTION_RETRIEVE,
      data: planMacro.get('id')
    });
  },

  componentWillUnmount() {
    DocumentStore.off(null, null, this);
  },

  componentWillReceiveProps(newProps) {
    if (newProps.location.pathname !== this.state.tabPath) {
      this.setState({
        tabPath: newProps.location.pathname
      });
      this.context.tabPanel.addTab(newProps.location.pathname, this.context.planMacro.get("name"));
    }
  },

  handleEditClick() {
    this.setState({
      isEditing: true,
      description: this.state.document.description
    });
  },

  handleSaveClick() {
    const { description, document } = this.state;

    if (description.trim() === '') {
      this.context.toastr.addAlertError("O campo descrição não pode ser vazio");
      return;
    }

    const updatedDocument = {
      ...document,
      description: description
    };

    DocumentStore.dispatch({
      action: DocumentStore.ACTION_UPDATE,
      data: updatedDocument
    })

    this.setState({
      isEditing: false,
      document: updatedDocument
    });
  },

  handleCancelClick() {
    this.setState({
      isEditing: false,
      description: this.state.document.description
    });
  },

  handleDescriptionChange(event) {
    const value = event.target.value;
    this.setState({
      description: value
    });
  },

  render() {
    if (!this.state.loaded) {
      return <LoadingGauge />;
    }
    return (
      <div className="media-list">
        <div className="media">
          <div className="media-body">
            <div className="title-wrapper">
              <h1> 
                {this.state.document.title}
                {(this.context.roles.MANAGER || _.contains(this.context.permissions, PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && 
                <span className="mdi mdi-pencil cursorPointer deleteIcon" onClick={this.handleEditClick} />}
              </h1>
            </div>
            <div className="fpdi-text-label">{Messages.get("label.title.description")}</div>
            {this.state.isEditing ? (
              <div>
                <TextArea
                  rows={'3'}
                  maxLength={10000}
                  className="form-control minHeight180"
                  placeholder="Insira uma descrição"
                  name="Description"
                  value={this.state.description}
                  onChange={this.handleDescriptionChange}
                />
                <div className="textAreaMaxLenght documentText">
                  <span>{Messages.getEditable("label.maxTenThousandCaracteres", "fpdi-nav-label")}</span>
                </div>
              </div>
            ) : (
              <p className="pdi-normal-text">
                {this.state.document.description}
              </p>
            )}
            {this.state.isEditing && (
              <div>
                <ConfirmButton type="submit" onClick={this.handleSaveClick}>
                  {Messages.get("label.submitLabel")}
                </ConfirmButton>
                <button className="btn btn-sm btn-default" onClick={this.handleCancelClick}>
                  {Messages.get('label.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
});
