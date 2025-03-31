import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import UnitsTable from 'forpdi/src/forrisco/components/unit/UnitsTable';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ExportReportModal from 'forpdi/src/components/modals/ExportReportModal';
import Modal from 'forpdi/src/components/modals/Modal';
import { getYearsToSelect, parseSortedByToList } from 'forpdi/src/utils/util';
import { getYearFromDateTime } from 'forpdi/src/utils/dateUtil';

import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import Messages from 'forpdi/src/Messages';
import { formatValuesToExport } from 'forpdi/src/forrisco/helpers/exportReportHelper';


class PlanRiskUnits extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      units: null,
      risks: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingDataToExportRepoort: false,
      unitsToExportReport: null,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    UnitStore.on('allunitsbyplanpaginated', (response) => {
      this.setState({
        units: response.data,
        total: response.total,
      });
    }, this);

    UnitStore.on('unitDeleted', (deleted) => {
      const { toastr } = this.context;
      const { units, total } = this.state;
      const updatedUnits = units.filter(unit => unit.id !== deleted.data.id);

      toastr.addAlertSuccess(Messages.get('notification.unit.delete'));
      this.setState({ units: updatedUnits, total: total - 1 });
    }, this);

    UnitStore.on('allunitsbyplan', ({ data }) => {
      const unitsToExportReport = data;
      this.setState({
        unitsToExportReport,
        waitingDataToExportRepoort: false,
      });
      this.showExportReportModal(unitsToExportReport);
    }, this);

    RiskStore.on('riskbyplan', ({ data }) => {
      this.setState({
        risks: data.list,
      });
    }, this);

    this.findUnits(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
  }

  findUnits = (page, pageSize, searchTerm, sortedBy) => {
    const { params } = this.props;
    const { planRiskId } = params;

    this.setState({
      page,
      pageSize,
      sortedBy,
      units: null,
      total: null,
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_FIND_ALL_BY_PLAN_PAGINATED,
      data: {
        planRiskId,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_BY_PLAN,
      data: planRiskId,
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findUnits(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  onNewUnit = () => {
    const { params } = this.props;
    const { router } = this.context;
    const { planRiskId } = params;

    router.push(`forrisco/plan-risk/${planRiskId}/unit/new`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortedBy) => {
    const { pageSize, searchTerm } = this.state;
    this.findUnits(1, pageSize, searchTerm, newSortedBy);
  }

  retrieveDataToExportReport = () => {
    const { params } = this.props;
    const { planRiskId } = params;
    const { unitsToExportReport } = this.state;

    if (!unitsToExportReport) {
      UnitStore.dispatch({
        action: UnitStore.ACTION_FIND_ALL_BY_PLAN,
        data: planRiskId,
      });

      this.setState({ waitingDataToExportRepoort: true });
    } else {
      this.showExportReportModal(unitsToExportReport);
    }
  }

  showExportReportModal(units) {
    const { risks } = this.state;

    const unitTopic = Messages.get('label.units');
    const subunitTopic = Messages.get('label.subunitys');
    const options = {
      [unitTopic]: [],
      [subunitTopic]: [],
    };

    _.forEach(units, ({ id, name, parent }) => {
      const topic = !parent ? unitTopic : subunitTopic;
      options[topic].push({ id, name });
    });

    const onExport = (universityName, checkedValues, selectedYear) => {
      const checkedUnits = formatValuesToExport(options[unitTopic], checkedValues);
      const checkedSubunits = formatValuesToExport(options[subunitTopic], checkedValues);
      const { params } = this.props;
      const { planRiskId } = params;

      const url = `${UnitStore.url}/exportUnitReport?planRiskId=${encodeURIComponent(planRiskId)}&title=${encodeURIComponent(universityName)}&units=${encodeURIComponent(checkedUnits)}&subunits=${encodeURIComponent(checkedSubunits)}&selectedYear=${encodeURIComponent(selectedYear)}`;
      window.open(url, universityName);
    };

    const defaultOption = { name: Messages.get('label.viewAll'), id: -1 };
    const yearsToSelect = [defaultOption,
      ...getYearsToSelect(risks, ({ begin }) => getYearFromDateTime(begin))];

    const modal = (
      <ExportReportModal
        onExport={onExport}
        options={options}
        customValidation={(checkedValues) => {
          const checkedUnits = formatValuesToExport(options[unitTopic], checkedValues);
          if (!checkedUnits) {
            return { checkedValues: Messages.get('label.noUnitSelected') };
          }
          return null;
        }}
        years={yearsToSelect}
      />
    );

    Modal.show(modal);
  }

  render() {
    const { hasForriscoManageUnitPermission } = this.context;
    const {
      units,
      page,
      pageSize,
      total,
      searchTerm,
      sortedBy,
      waitingDataToExportRepoort,
    } = this.state;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.units')}</SecondaryTitle>
            <div>
              <IconButton
                title={Messages.get('label.exportReport')}
                icon="download"
                loading={waitingDataToExportRepoort}
                onClick={this.retrieveDataToExportReport}
              />
              {
                hasForriscoManageUnitPermission && (
                  <PrimaryButton
                    text={Messages.get('label.unityRiskRegister')}
                    title={Messages.get('label.unityRiskRegister')}
                    onClick={this.onNewUnit}
                    style={{ marginLeft: '15px' }}
                  />
                )
              }
            </div>
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findUnits(1, pageSize, term, [])}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <UnitsTable
            units={units}
            onSort={this.onSort}
            sortedBy={sortedBy}
            isTabbedPanelContent
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

PlanRiskUnits.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
};

PlanRiskUnits.propTypes = {
  params: PropTypes.shape({}),
};

PlanRiskUnits.defaultProps = {
  params: {},
};

export default PlanRiskUnits;
