import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ContingencyTable from 'forpdi/src/forrisco/components/risk/contingency/ContingencyTable';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import Messages from 'forpdi/src/Messages';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';
import { parseSortedByToList } from 'forpdi/src/utils/util';


class RiskContingency extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contingencies: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    RiskStore.on('contingencyListed', (response) => {
      this.setState({
        contingencies: response.data,
        total: response.total,
      });
    }, this);

    RiskStore.on('contingencyDeleted', ({ data }) => {
      const { contingencies, total } = this.state;
      const { toastr } = this.context;
      const updatedContingencies = _.filter(contingencies,
        contingency => contingency.id !== data.id);

      toastr.addAlertSuccess(Messages.get('notification.contingency.deleted'));
      this.setState({ contingencies: updatedContingencies, total: total - 1 });
    }, this);

    this.findContingency(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onNewContingency = () => {
    const { router } = this.context;
    const { risk } = this.props;

    router.push(`/forrisco/risk/${risk.id}/contingency/new`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  findContingency = (page, pageSize, searchTerm, sortedBy) => {
    const { risk } = this.props;
    const riskId = risk.id;

    this.setState({
      page,
      pageSize,
      sortedBy,
      contingencies: null,
      total: null,
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_LIST_CONTINGENCY,
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
    this.findContingency(page, pageSize, searchTerm, sortedBy);
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
    this.findContingency(1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const { hasForriscoManageRiskItemsPermission } = this.context;
    const {
      contingencies,
      page,
      pageSize,
      sortedBy,
      total,
      searchTerm,
    } = this.state;
    const { risk } = this.props;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.contingencyActions')}</SecondaryTitle>
            {
              isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission) && (
                <PrimaryButton
                  text={Messages.get('label.contingencyRegister')}
                  title={Messages.get('label.contingencyRegister')}
                  onClick={this.onNewContingency}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findContingency(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <ContingencyTable
            contingencies={contingencies}
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

RiskContingency.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

RiskContingency.propTypes = {
  risk: PropTypes.shape({}),
};

RiskContingency.defaultProps = {
  risk: null,
};

export default RiskContingency;
