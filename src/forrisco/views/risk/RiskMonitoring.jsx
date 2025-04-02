import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import MonitorTable from 'forpdi/src/forrisco/components/risk/monitor/MonitorTable';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import Messages from 'forpdi/src/Messages';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';
import { parseSortedByToList } from 'forpdi/src/utils/util';


class RiskMonitoring extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitors: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    RiskStore.on('monitorListed', (response) => {
      this.setState({
        monitors: response.data,
        total: response.total,
      });
    }, this);

    RiskStore.on('monitorDeleted', ({ data }) => {
      const { monitors, total } = this.state;
      const { toastr } = this.context;
      const updatedMonitors = _.filter(monitors, monitor => monitor.id !== data.id);

      toastr.addAlertSuccess(Messages.get('notification.monitoring.deleted'));
      this.setState({ monitors: updatedMonitors, total: total - 1 });
    }, this);

    this.findMonitors(1, pageSize, searchTerm, sortedBy);
  }

  onNewMonitor = () => {
    const { router } = this.context;
    const { risk } = this.props;

    router.push(`/forrisco/risk/${risk.id}/monitors/new`);
  }

  findMonitors = (page, pageSize, searchTerm, sortedBy) => {
    const { risk } = this.props;
    const riskId = risk.id;

    this.setState({
      page,
      pageSize,
      sortedBy,
      monitors: null,
      total: null,
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_LIST_MONITOR,
      data: {
        riskId,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findMonitors(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortBy) => {
    const {
      pageSize,
      searchTerm,
    } = this.state;
    this.findMonitors(1, pageSize, searchTerm, newSortBy);
  }

  render() {
    const { hasForriscoManageRiskItemsPermission } = this.context;
    const {
      monitors,
      page,
      pageSize,
      total,
      searchTerm,
      sortedBy,
    } = this.state;
    const { risk } = this.props;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.monitor.history')}</SecondaryTitle>
            {
              isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission) && (
                <PrimaryButton
                  text={Messages.get('label.newMonitor')}
                  title={Messages.get('label.newMonitor')}
                  onClick={this.onNewMonitor}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findMonitors(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <MonitorTable
            monitores={monitors}
            onSort={this.onSort}
            sortedBy={sortedBy}
            showHeader
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

RiskMonitoring.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

RiskMonitoring.propTypes = {
  risk: PropTypes.shape({}),
};

RiskMonitoring.defaultProps = {
  risk: null,
};

export default RiskMonitoring;
