import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import { parseSortedByToList } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

class PolicyMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      policies: null,
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

    const me = this;
    PolicyStore.on('unarchivedPolicyForMenu', (store) => {
      me.setState({
        policies: store.data,
        total: store.total,
      });
    }, me);

    PolicyStore.on('policyDeleted', (response, policyId) => {
      const { policies, total } = this.state;
      const { toastr } = this.context;

      const updatedPolicies = policies.filter(policy => policy.id !== policyId);
      toastr.addAlertSuccess(Messages.get('label.notification.policy.delete'));
      this.setState({ policies: updatedPolicies, total: total - 1 });
    }, this);

    this.findPolicies(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  extractDate(dateTime) {
    return dateTime ? dateTime.split(' ')[0] : '';
  }

  findPolicies(page, pageSize, searchTerm, sortedBy) {
    this.setState({
      page,
      pageSize,
      sortedBy,
      policies: null,
      total: null,
    });
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_FIND_UNARCHIVED_FOR_MENU,
      data: {
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  deletePolicy = (policyId) => {
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_DELETE,
      data: policyId,
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findPolicies(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  onHandleClick = () => {
    const { router } = this.context;
    router.push('/forrisco/policy/new');

    this.setState({
      waitingSubmit: true,
    });
  }

  onHandleRedirect = (policy) => {
    const { router } = this.context;
    router.push(`/forrisco/policy/${policy.id}`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  renderTable() {
    const { policies, sortedBy } = this.state;
    const { hasForriscoManagePolicyPermission } = this.context;

    const renderValidityCol = ({ validityBegin, validityEnd }) => (
      <span>
        {this.extractDate(validityBegin)}
        <span style={{ margin: '0 10px' }}>à</span>
        {this.extractDate(validityEnd)}
      </span>
    );

    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deletePolicyConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.deletePolicy(data.id)}
        />
      );
      Modal.show(confirmModal);
    };

    const onEdit = (policy) => {
      const { router } = this.context;
      router.push(`/forrisco/policy/edit/${policy.id}`);
    };

    const onDisabled = policy => policy.hasLinkedPlans;

    const onSort = (newSortedBy) => {
      const { pageSize, searchTerm } = this.state;
      this.findPolicies(1, pageSize, searchTerm, newSortedBy);
    };

    const columns = [
      {
        name: Messages.get('label.policyName'), field: 'name', width: '50%', sort: true,
      },
      {
        name: Messages.get('label.policyValidity'), field: 'validityBegin', width: '45%', render: renderValidityCol, sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editPolicy'),
        action: onEdit,
        disabled: onDisabled,
      },
      { icon: 'trash', title: Messages.get('label.deletePolicy'), action: onHandleRenderDeleteModal },
    ];

    return (
      <Table
        data={policies}
        columns={columns}
        sortedBy={sortedBy}
        onSort={onSort}
        redirect={this.onHandleRedirect}
        actionColumnItems={hasForriscoManagePolicyPermission ? actionColumnItems : null}
      />
    );
  }

  render() {
    const {
      policies,
      total,
      page,
      pageSize,
      searchTerm,
      sortedBy,
      waitingSubmit,
    } = this.state;
    const { hasForriscoManagePolicyPermission } = this.context;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.policies')} />
          {
            hasForriscoManagePolicyPermission && (
              <PrimaryButton
                title={Messages.get('label.policyRegister')}
                text={Messages.get('label.policyRegister')}
                onClick={this.onHandleClick}
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
                onSubmit={term => this.findPolicies(1, pageSize, term, sortedBy)}
              />
              {
                policies ? this.renderTable() : <LoadingGauge />
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

PolicyMainPage.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default PolicyMainPage;
