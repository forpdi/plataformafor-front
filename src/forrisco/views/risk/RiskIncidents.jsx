import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import IncidentTable from 'forpdi/src/forrisco/components/risk/incident/IncidentTable';
import Pagination from 'forpdi/src/components/Pagination';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';
import { parseSortedByToList } from 'forpdi/src/utils/util';


class RiskIncidents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      incidents: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    RiskStore.on('incidentListed', (response) => {
      this.setState({
        incidents: response.data,
        total: response.total,
      });
    }, this);

    RiskStore.on('incidentDeleted', (response) => {
      const { toastr } = this.context;
      const { incidents, total } = this.state;
      const updatedIncidents = incidents.filter(incident => incident.id !== response.data);

      toastr.addAlertSuccess(Messages.get('notification.incident.delete'));
      this.setState({ incidents: updatedIncidents, total: total - 1 });
    }, this);

    this.findIncidents(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  findIncidents(page, pageSize, searchTerm, sortedBy) {
    const { params } = this.props;
    const { riskId } = params;

    this.setState({
      page,
      pageSize,
      sortedBy,
      incidents: null,
      total: null,
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_LIST_INCIDENT,
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
    this.findIncidents(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  onNewIncident = () => {
    const { router } = this.context;
    const { params } = this.props;
    const { riskId } = params;

    router.push(`forrisco/risk/${riskId}/incidents/new`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
    } = this.state;

    this.findIncidents(1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const { hasForriscoManageRiskItemsPermission } = this.context;
    const {
      total,
      page,
      pageSize,
      searchTerm,
      sortedBy,
      incidents,
    } = this.state;
    const { risk } = this.props;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.incidentsHistory')}</SecondaryTitle>
            {
              isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission) && (
                <PrimaryButton
                  text={Messages.get('label.newIncident')}
                  title={Messages.get('label.newIncident')}
                  onClick={this.onNewIncident}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findIncidents(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <IncidentTable
            incidents={incidents}
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

RiskIncidents.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

RiskIncidents.propTypes = {
  params: PropTypes.shape({}).isRequired,
  risk: PropTypes.shape({}),
};

RiskIncidents.defaultProps = {
  risk: null,
};

export default RiskIncidents;
