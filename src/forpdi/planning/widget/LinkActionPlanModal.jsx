import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';
import Messages from 'forpdi/src/Messages';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import SwitchToggleButton from 'forpdi/src/components/buttons/SwitchToggleButton'
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TablePagination from "forpdi/src/forpdi/core/widget/TablePagination.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import { parseDate, splitDateTime } from 'forpdi/src/utils/dateUtil';
import ActionPlanStore from "forpdi/src/forpdi/planning/store/ActionPlan.jsx";

import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';


class LinkActionPlanModal extends React.Component {
  constructor(props) {
    super(props);

    const {
      users, parentId,
    } = props;

    this.state = {
      actionPlan: null,
      goals: [],
      users,
      isLinked: null,
      parentId,
      checkedValue: null,
      page: 1,
      pageSize: 5,
      total: null,
      simpleFilter: '',
    };
  }
  componentDidMount() {
    StructureStore.on("filteredgoalsretrivied", (model) => {
      this.setState({
        goals: model.data,
        total: model.total,
      });
    }, this);

    this.goalSearch();

    ActionPlanStore.on("actionPlanId", (model) => {
      const linkedGoal = model.data.linkedGoal;
      this.setState({
        actionPlan: model.data,
        isLinked: !!linkedGoal,
        checkedValue: linkedGoal ? linkedGoal.id : null,
      });
    }, this);

    ActionPlanStore.dispatch({
      action: ActionPlanStore.ACTION_RETRIVE_ACTION_PLAN_ID,
      data: this.props.actionPlanId,
    });

  }

  componentWillUnmount() {
    StructureStore.off(null, null, this);
    ActionPlanStore.off(null, null, this);
  }

  onClickHandler(item) {
    Modal.hide();
    this.onClick(item);
  }

  toggleCheck = (e) => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  }

  goalIsChecked(id) {

    const { checkedValue } = this.state;
    return checkedValue === id;
  }

  toggleCheckGoals = (goal) => {
    const { id } = goal;
    this.setState({ checkedValue: id });
  }

  renderCheckBox(goal, idx) {
    const { id } = goal;

    return (
      <CheckBox
        key={id}
        onChange={() => this.toggleCheckGoals(goal, idx)}
        checked={this.goalIsChecked(id)}
        label={''}
      />
    );
  }

  onHandleRenderSubmitModal = () => {
    const { isLinked } = this.state;

    const modalTextLink = Messages.get('label.linkPlanAction');
    const modalTextCancelLink = Messages.get('label.cancelLinkPlanAction');

    const confirmModal = (
      <ConfirmModal
        text={isLinked ? modalTextLink : modalTextCancelLink}
        onConfirm={() => this.confirmSubmit()}
      />
    );
    Modal.show(confirmModal, 'fpdi');
  };

  confirmSubmit(){
    const { checkedValue, isLinked } = this.state;
    const { onChange } = this.props

    onChange(isLinked ? checkedValue : null);
    Modal.hide();
  }

  getDate(elem) {
    const { date } = splitDateTime(elem);
    return parseDate(date);
  }

  pageChange = (page, pageSize) => {
    this.setState({ page, pageSize }, () => this.goalSearch());
  }

  onChangeSimpleFilter = (event) => {
    const { target } = event;
    this.setState({ simpleFilter: target.value })
  }

  goalSearch() {
    const { page, pageSize, simpleFilter, parentId } = this.state;

    StructureStore.dispatch({
      action: StructureStore.ACTION_GET_FILTERED_GOALS,
      data: {
        name: simpleFilter,
        page,
        parentId,
        pageSize,
      },
    });
  }

  clearSearch = () => {
    this.setState({
      simpleFilter: '',
      page: 1
    }, () => this.goalSearch());
  }

  onClickSearch = () => {
    this.setState({
      page: 1,
    }, () => this.goalSearch());
  }

  onSearchKeyPress = (event) => {
    const { key } = event;
    if (key === 'Enter') {
      this.onClickSearch();
    }
  }

  getSearchComponent() {
    const { simpleFilter } = this.state;
    return (
      <div className="inner-addon right-addon right-addonPesquisa plan-search-border" style={{"marginLeft": "15px"}}>
        <i key="clear-search" className="mdiClose mdi mdi-close pointer" onClick={this.clearSearch} title={Messages.get("label.clean")}> </i>
        <input key="search-input" style={{ paddingRight: "30px" }} type="text" className="form-control-busca" placeholder={Messages.get('label.research')} value={simpleFilter} onChange={this.onChangeSimpleFilter} ref="name" onKeyDown={this.onSearchKeyPress} />
        <i key="search-icon" id="searchIcon" className="mdiIconPesquisa mdiBsc  mdi mdi-magnify pointer" onClick={this.onClickSearch} title={Messages.get("label.search")}></i>
      </div>
    );
  }

  renderInfoDisplay(label, info){
    return (
      <div>
        <Text style={{ margin: '0 0 5px 0' }} fontSize="14px">
          <b>{label}</b>
        </Text>

        <Text>
          {info}
        </Text>
      </div>)
  }

  renderInfoRow(goal, idx){
    const { users } = this.state;
    return (
      <tr key={goal.id}>
        <td key={`checkbox-${goal.id}`}>
          {this.renderCheckBox(goal, idx)}
        </td>
        <td key={`attribute-name-${goal.id}`}>
          {goal.name}
        </td>
        {goal.level.attributes.map((attribute, id) => {
          if (attribute.type == AttributeTypes.RESPONSIBLE_FIELD) {
            for (var i=0; i<users.length; i++) {
              if(attribute.attributeInstances[idx]){
                if (this.props.users[i].id == attribute.attributeInstances[idx].value) {
                  return(
                    <td key={`attribute-${goal.id}-${id}`}>
                      {this.props.users[i].name}
                    </td>
                  );
                }
              } else {
                return <td />;
              }
            }
          }
          if (attribute.finishDate == true) {
            return (
              <td key={`attribute-${goal.id}-${id}`}>
                {attribute.attributeInstances[idx] ? attribute.attributeInstances[idx].value : ""}
                {goal.deadlineStatus == 3 && <i className="mdi-clock-late-goal mdi mdi-clock pointer"  title="Meta atrasada"/>}
              </td>
            );
          }
        })}
      </tr>
    )
  }

  sort(direction, fieldName, getField) {
    var data = [];
    data = this.state.goals;

    if (direction == "asc") {
      data.sort((a, b) => {
        return getField(a) < getField(b) ? -1 : 1
      })
    } else if (direction == "desc") {
      data.sort((a, b) => {
        return getField(a) < getField(b) ? 1 : -1
      })
    }

    this.setState({
      sortFieldName: fieldName,
      sortDirection: direction,
    })
  }

  renderStatus(action) {
    const { checked, notChecked } = action;

    if(checked){
      return 'Concluído';
    } else if(notChecked) {
      return 'Não concluído'
    } else {
      return 'Sem status'
    }
  }

  renderHeader() {
    const { heading } = this.props;

    return (
      <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', padding: '10px 30px 0px 20px' }}>
        <SecondaryTitle>
          {heading}
        </SecondaryTitle>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderActionPlanInfo() {
    const { actionPlan, isLinked } = this.state;
    
    return (
      <div
        style={{ padding: '0 35px' }}
      >
        <div className="row">
          <div className="col-sm-6">
            {this.renderInfoDisplay(Messages.get('label.responsibleInformed'), actionPlan.user.name)}
          </div>
          <div className="col-sm-6">
            {this.renderInfoDisplay(Messages.get('label.status'), this.renderStatus(actionPlan))}
          </div>
        </div>
        <div style = {{marginTop: '1rem'}}>
          {this.renderInfoDisplay(Messages.get('label.description'), actionPlan.description)}
        </div>
        <div style = {{marginTop: '1rem'}} className="row">
          <div className="col-sm-2">
            {this.renderInfoDisplay(Messages.get('label.begin'), actionPlan.begin.split(' ')[0])}
          </div>
          <div className="col-sm-2">
            {this.renderInfoDisplay(Messages.get('label.end'), actionPlan.end.split(' ')[0])}
          </div>
        </div>
        <div style = {{marginTop: '1rem'}}>
          <SwitchToggleButton
            id="isLinked"
            name="isLinked"
            onChange={e => this.toggleCheck(e)}
            label={Messages.get('label.linkToGoal')}
            checked={isLinked}
          />
        </div>
        <Modal.Line />
      </div>
    );
  }

  renderGoalsInfo() {
    const { goals, actionPlan, page, pageSize, total } = this.state;

    return (
      <div style={{ padding: '0px 35px' }}>
        <div className="panel panel-default panel-margins">

        <div className="panel-heading dashboard-panel-title" style={{display: 'flex', paddingTop: '10px'}}>
					<b className="budget-graphic-title">{Messages.getEditable("label.goalSing","fpdi-nav-label")}</b>
					<div className="budget-btns">
						<div style={{display: 'flex', alignItems: 'baseline'}} className="floatLeft">
							{this.getSearchComponent()}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            {this.state.loading ? <LoadingGauge /> :
              <div>
                <table className="budget-field-table table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ width: '300px' }}>{Messages.getEditable("label.name","fpdi-nav-label")}
                        <span className={this.state.sortFieldName == "name" ?
                          (this.state.sortDirection == "asc" ? "mdi mdi-sort-descending cursorPointer" : "mdi mdi-sort-ascending cursorPointer") : "mdi mdi-sort cursorPointer"}
                          onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "name" ? "desc" : "asc", "name", (elem) => elem["name"].toUpperCase())}
                          title="Ordenar">
                        </span>
                      </th>
                      <th>{Messages.getEditable("label.responsible","fpdi-nav-label")}
                        <span
                          onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "responsible" ? "desc" : "asc", "responsible", (elem) => this.getResponsibleName(elem).toUpperCase())}
                          title="Ordenar">
                        </span>
                      </th>
                      <th>{Messages.getEditable("label.maturity","fpdi-nav-label")}
                        <span className={this.state.sortFieldName == "maturity" ?
                          (this.state.sortDirection == "asc" ? "mdi mdi-sort-descending cursorPointer" : "mdi mdi-sort-ascending cursorPointer") : "mdi mdi-sort cursorPointer"}
                          onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "maturity" ? "desc" : "asc", "maturity", (elem) => this.getDate(elem["maturity"]))}
                          title="Ordenar">
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.map((goal, idx) => {
                      return this.renderInfoRow(goal, idx);
                    })}
                  </tbody>
                </table>
              </div>}

            <TablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChangePage={this.pageChange}
              tableName={"actionPlanLink-table-"+actionPlan.id}
            />
          </div>
        </div>
      </div>
    );
  }

  renderButtons() {
    return(
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
        <SecondaryButton text={Messages.get('label.cancel')} onClick={() => Modal.hide()} />
        <PrimaryButton
          text={Messages.get('label.submitLabel')}
          onClick={this.onHandleRenderSubmitModal}
        />
      </div>
    )}

  render() {
    const { isLinked, actionPlan } = this.state;

    return (
      <Modal width="750px" height="auto">
        <div className="custom-scrollbar" style={{ overflowY: 'auto', height: 'auto' }}>
          {!actionPlan ? (
            <LoadingGauge />
          ) : (
            <div>
              {this.renderHeader()}
              {this.renderActionPlanInfo()}
              {isLinked && this.renderGoalsInfo()}
              {this.renderButtons()}
              </div>
          )}
        </div>
      </Modal>
    );
  }
}

LinkActionPlanModal.propTypes = {
  heading: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  parentId: PropTypes.number.isRequired,
  actionPlanId: PropTypes.number.isRequired,
};

export default LinkActionPlanModal;
