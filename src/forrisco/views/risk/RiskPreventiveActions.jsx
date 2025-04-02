import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import PreventiveActionsTable from 'forpdi/src/forrisco/components/risk/preventiveAction/PreventiveActionsTable';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';
import { parseSortedByToList } from 'forpdi/src/utils/util';


class RiskPreventiveActions extends React.Component {
  constructor(props) {
    super(props);

    this.onNewPreventiveAction = this.onNewPreventiveAction.bind(this);

    this.state = {
      preventiveActions: null,
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
    const { toastr } = this.context;

    RiskStore.on('preventiveActionsListed', (response) => {
      this.setState({
        preventiveActions: response.data,
        total: response.total,
      });
    }, this);

    RiskStore.on(
      'preventiveActionDeleted', ({ data }) => {
        const { preventiveActions, total } = this.state;
        const { id: deletedId } = data;

        const updatedActions = preventiveActions.filter(action => action.id !== deletedId);
        this.setState({ preventiveActions: updatedActions, total: total - 1 });
        toastr.addAlertSuccess(Messages.get('notification.preventiveAction.deleted'));
      },
    );

    this.findPreventiveActions(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  findPreventiveActions(page, pageSize, searchTerm, sortedBy) {
    const { risk } = this.props;
    const { id } = risk;

    this.setState({
      page,
      pageSize,
      sortedBy,
      preventiveActions: null,
      total: null,
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_LIST_PREVENTIVE_ACTIONS,
      data: {
        riskId: id,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  onNewPreventiveAction = () => {
    const { router } = this.context;
    const { risk } = this.props;

    router.push(`/forrisco/risk/${risk.id}/preventiveActions/new`);

    this.setState({
      waitingSubmit: true,
    });
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findPreventiveActions(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
    } = this.state;
    this.findPreventiveActions(1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const { hasForriscoManageRiskItemsPermission } = this.context;
    const {
      waitingSubmit,
      total,
      pageSize,
      page,
      searchTerm,
      sortedBy,
      preventiveActions,
    } = this.state;
    const { risk } = this.props;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.preventiveActions')}</SecondaryTitle>
            {
              (isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission)) && (
                <PrimaryButton
                  text={Messages.get('label.preventiveActionRegister')}
                  title={Messages.get('label.preventiveActionRegister')}
                  onClick={this.onNewPreventiveAction}
                  loading={waitingSubmit}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findPreventiveActions(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <PreventiveActionsTable
            preventiveActions={preventiveActions}
            onSort={this.onSort}
            sortedBy={sortedBy}
            risk={risk}
          />
        </TabbedPanel.MainContainer>
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
        />
      </div>
    );
  }
}

RiskPreventiveActions.propTypes = {
  risk: PropTypes.shape({}),
};

RiskPreventiveActions.defaultProps = {
  risk: null,
};


RiskPreventiveActions.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

export default RiskPreventiveActions;
