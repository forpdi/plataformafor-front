import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import UnitsTable from 'forpdi/src/forrisco/components/unit/UnitsTable';

import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import Messages from 'forpdi/src/Messages';
import { parseSortedByToList } from 'forpdi/src/utils/util';


const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };

class UnitMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      units: null,
      plans: [viewAllOption],
      planRiskId: viewAllOption.id,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const {
      pageSize,
      page,
      searchTerm,
      sortedBy,
    } = this.state;

    UnitStore.on('unit-listUnits', (store) => {
      this.setState({
        units: store.data,
        total: store.total,
      });
    }, this);

    UnitStore.on('unitDeleted', (deleted) => {
      const { toastr } = this.context;
      const { units, total } = this.state;
      const updatedUnits = units.filter(unit => unit.id !== deleted.data.id);

      toastr.addAlertSuccess(Messages.get('notification.unit.delete'));
      this.setState({ units: updatedUnits, total: total - 1 });
    }, this);

    PlanRiskStore.on('list-to-select', ({ data }) => {
      this.setState({ plans: [viewAllOption, ...data.list] });
    }, this);

    this.findUnits(page, pageSize, null, searchTerm, sortedBy);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
    });
  }

  componentWillUnmount() {
    UnitStore.off(null, null, null);
    PlanRiskStore.off(null, null, null);
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, planRiskId, sortedBy } = this.state;
    this.findUnits(page, pageSize, planRiskId, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  findUnits(page, pageSize, planRiskId, searchTerm, sortedBy) {
    this.setState({
      page,
      pageSize,
      sortedBy,
      units: null,
      total: null,
    });
    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_UNITS,
      data: {
        page,
        pageSize,
        planRiskId: planRiskId === viewAllOption.id ? null : planRiskId,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  onHandleClick = () => {
    const { router } = this.context;
    router.push('/forrisco/unit/new');

    this.setState({
      waitingSubmit: true,
    });
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onPlanRiskChange = (e) => {
    const { pageSize, searchTerm } = this.state;
    const { value } = e.target;
    const planRiskId = parseInt(value, 10);
    this.setState({ planRiskId });
    this.findUnits(1, pageSize, planRiskId, searchTerm, null);
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
      planRiskId,
    } = this.state;
    this.findUnits(1, pageSize, planRiskId, searchTerm, newSortedBy);
  }

  render() {
    const {
      units,
      plans,
      planRiskId,
      total,
      page,
      pageSize,
      searchTerm,
      sortedBy,
      waitingSubmit,
    } = this.state;
    const { hasForriscoManageUnitPermission } = this.context;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.units')} />
          {
            hasForriscoManageUnitPermission && (
              <PrimaryButton
                title={Messages.get('label.unityRiskRegister')}
                text={Messages.get('label.unityRiskRegister')}
                onClick={this.onHandleClick}
                loading={waitingSubmit}
              />
            )
          }
        </AppContainer.TopContent>
        <AppContainer.MainContent>
          <AppContainer.ScrollableContent>
            <AppContainer.Section>
              <div style={{ display: 'flex', marginBottom: '48px', width: '700px' }}>
                <SearchBox
                  value={searchTerm}
                  containerStyle={{ alignSelf: 'flex-end', flex: 1 }}
                  placeholder={Messages.get('label.search')}
                  onChange={this.onSearchTermChange}
                  onSubmit={term => this.findUnits(1, pageSize, planRiskId, term, null)}
                />
                <SelectBox
                  options={plans}
                  containerStyle={{ margin: '0 0 0 10px', flex: 1 }}
                  label={Messages.get('label.risk.managementPlan')}
                  value={planRiskId}
                  onChange={this.onPlanRiskChange}
                />
              </div>
              <UnitsTable
                units={units}
                onSort={this.onSort}
                sortedBy={sortedBy}
              />
              <Pagination
                total={total}
                onChange={this.pageChange}
                page={page}
                pageSize={pageSize}
              />
            </AppContainer.Section>
          </AppContainer.ScrollableContent>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

UnitMainPage.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
};

UnitMainPage.propTypes = {
  params: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

UnitMainPage.defaultProps = {
  location: {},
};

export default UnitMainPage;
