import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import { parseSortedByToList } from 'forpdi/src/utils/util';

import Messages from 'forpdi/src/Messages';

class PlanRiskMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plans: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    PlanRiskStore.on('unarchivedPlanRiskForMenu', (store) => {
      this.setState({
        plans: store.data,
        total: store.total,
      });
    }, this);

    PlanRiskStore.on('deletePlanRisk', (response, planId) => {
      const { plans, total } = this.state;
      const updatedPlans = plans.filter(plan => plan.id !== planId);
      this.setState({ plans: updatedPlans, total: total - 1 });
    }, this);

    this.findPlans(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
  }

  extractDate(dateTime) {
    return dateTime ? dateTime.split(' ')[0] : '';
  }

  findPlans(page, pageSize, searchTerm, sortedBy) {
    this.setState({
      page,
      pageSize,
      sortedBy,
      plans: null,
      total: null,
    });
    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_FIND_UNARCHIVED_FOR_MENU,
      data: {
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  deletePlan(planId) {
    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_DELETE_PLANRISK,
      data: planId,
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findPlans(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
      plans: null,
    });
  }

  onHandleClick = (page) => {
    const { router } = this.context;
    router.push(`/forrisco/plan-risk/${page}`);

    this.setState({
      waitingSubmit: true,
    });
  }

  onHandleRedirect = (data) => {
    const { router } = this.context;
    router.push(`/forrisco/plan-risk/${data.id}`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  renderValidityCol = ({ validityBegin, validityEnd }) => (
    <span style={{ display: 'flex', flexWrap: 'wrap' }}>
      {this.extractDate(validityBegin)}
      <span style={{ margin: '0 10px' }}>à</span>
      {this.extractDate(validityEnd)}
    </span>
  )

  renderLinkedPolicy = ({ policy }) => (
    <span>
      {policy.name}
    </span>
  )

  renderTable() {
    const { plans, sortedBy } = this.state;
    const { hasForriscoManagePlanRiskPermission } = this.context;

    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deletePlanRiskConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.deletePlan(data.id)}
        />
      );
      Modal.show(confirmModal);
    };

    const onHandleClonePlan = (data) => {
      const page = `clone/${data.id}`;
      this.onHandleClick(page);
    };

    const onHandleEditPlan = (data) => {
      const page = `edit/${data.id}`;
      this.onHandleClick(page);
    };

    const onSort = (newSortedBy) => {
      const { pageSize, searchTerm } = this.state;
      this.findPlans(1, pageSize, searchTerm, newSortedBy);
    };

    const columns = [
      {
        name: Messages.get('label.planRiskName'), field: 'name', width: '35%', sort: true,
      },
      {
        name: Messages.get('label.policyValidity'), field: 'validityBegin', width: '35%', render: this.renderValidityCol, sort: true,
      },
      {
        name: Messages.get('label.linkedPolicy'), field: 'policy.name', width: '20%', render: this.renderLinkedPolicy, sort: true,
      },
    ];

    const actionColumnItems = [
      { icon: 'pen', title: Messages.get('label.editPlan'), action: onHandleEditPlan },
      { icon: 'clone', title: Messages.get('label.duplicatePlan'), action: onHandleClonePlan },
      { icon: 'trash', title: Messages.get('label.deletePlan'), action: onHandleRenderDeleteModal },
    ];

    return (
      <Table
        data={plans}
        columns={columns}
        redirect={this.onHandleRedirect}
        actionColumnItems={hasForriscoManagePlanRiskPermission ? actionColumnItems : null}
        sortedBy={sortedBy}
        onSort={newSortedBy => onSort(newSortedBy)}
      />
    );
  }

  hasSavePermission() {
    const { hasPermission, roles, permissionTypes } = this.context;
    return hasPermission(roles.ADMIN, permissionTypes.FORRISCO_MANAGE_PLAN_RISK_PERMISSION);
  }

  render() {
    const {
      plans,
      total,
      page,
      pageSize,
      searchTerm,
      waitingSubmit,
    } = this.state;
    const { hasForriscoManagePlanRiskPermission } = this.context;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.risk.managementPlans')} />
          {
            hasForriscoManagePlanRiskPermission && (
              <PrimaryButton
                title={Messages.get('label.planRiskRegister')}
                text={Messages.get('label.planRiskRegister')}
                onClick={() => this.onHandleClick('new')}
                loading={waitingSubmit}
              />
            )
          }
        </AppContainer.TopContent>
        <AppContainer.MainContent>
          <AppContainer.ScrollableContent>
            <AppContainer.Section>
              <SearchBox
                value={searchTerm}
                placeholder={Messages.get('label.search')}
                className="search-box-lists"
                onChange={this.onSearchTermChange}
                onSubmit={term => this.findPlans(1, pageSize, term, [])}
              />
              {
                plans ? this.renderTable() : <LoadingGauge />
              }
              {
                <Pagination
                  total={total}
                  onChange={this.pageChange}
                  page={page}
                  pageSize={pageSize}
                />
              }
            </AppContainer.Section>
          </AppContainer.ScrollableContent>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

PlanRiskMainPage.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

export default PlanRiskMainPage;
