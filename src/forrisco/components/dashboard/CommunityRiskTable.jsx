import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import Messages from 'forpdi/src/Messages';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import CircleStatus from 'forpdi/src/forrisco/components/dashboard/CircleStatus';
import riskState from 'forpdi/src/forrisco/enums/riskState';

import { getRisksByTypesAndUnit } from 'forpdi/src/forrisco/helpers/riskHelper';

class CommunityRiskTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      sortedBy: null,
    };
  }

  componentWillReceiveProps(newProps) {
    const { unitIds, riskType, strategyId } = this.props;

    const refreshIsNeeded = !_.isEqual(unitIds, newProps.unitIds)
      || !_.isEqual(riskType, newProps.riskType)
      || !_.isEqual(strategyId, newProps.strategyId);

    if (refreshIsNeeded) {
      this.refreshData(newProps);
    }
  }

  componentDidMount() {
    this.refreshData(this.props);
  }

  onSort = (sortedBy) => {
    this.setState({ tableData: null });
    setTimeout(() => {
      const { pageSize } = this.state;
      this.allTableData = _.sortBy(
        this.allTableData,
        elem => (elem[sortedBy.field] ? elem[sortedBy.field].toLocaleLowerCase() : ''),
      );
      if (sortedBy.order === 'desc') {
        this.allTableData.reverse();
      }
      this.setState({
        tableData: this.slicePage(1, pageSize),
        sortedBy,
      });
    }, 200);
  }

  renderTable() {
    const { tableData, sortedBy } = this.state;

    const renderMonitoring = (risk) => {
      const { monitoringState } = risk;
      return (
        <CircleStatus
          title={riskState[monitoringState].label}
          color={riskState[monitoringState].color}
        />
      );
    };

    const columns = [
      {
        name: Messages.get('label.risk.name'), field: 'name', width: '30%', sort: true,
      },
      {
        name: Messages.get('label.unityName'), field: 'unitName', width: '30%', sort: true,
      },
      {
        name: Messages.get('label.subunitName'), field: 'subunitName', width: '30%', sort: true,
      },
      {
        name: Messages.get('label.monitoring'), render: renderMonitoring, width: '10%',
      },
    ];

    return (
      <Table
        data={tableData}
        columns={columns}
        onSort={this.onSort}
        sortedBy={sortedBy}
      />
    );
  }

  refreshData({
    risks, riskType, unitIds, strategyId,
  }) {
    const { page, pageSize } = this.state;
    const { units } = this.props;

    const allFilteredRisks = getRisksByTypesAndUnit(risks, riskType, [-1], unitIds, strategyId);
    this.allTableData = _.map(allFilteredRisks, ({
      id: riskId, name, unitId, monitoringState,
    }) => {
      const unit = _.find(units, ({ id }) => id === unitId);
      let unitName;
      let subunitName;
      if (unit.parentId) {
        const parent = unit.parentId ? _.find(units, ({ id }) => id === unit.parentId) : null;
        unitName = parent.name;
        subunitName = unit.name;
      } else {
        unitName = unit.name;
        subunitName = null;
      }
      return {
        id: riskId,
        name,
        unitName,
        subunitName,
        monitoringState,
      };
    });

    const slicedTableData = this.slicePage(page, pageSize);

    this.setState({
      tableData: slicedTableData,
      total: this.allTableData.length,
    });
  }

  pageChange = (page, pageSize) => {
    const tableData = this.slicePage(page, pageSize);

    this.setState({
      tableData,
      page,
      pageSize,
    });
  }

  slicePage(page, pageSize) {
    const last = page * pageSize;
    const first = last - pageSize;

    return this.allTableData.slice(first, last);
  }

  render() {
    const {
      tableData, page, pageSize, total,
    } = this.state;

    return (
      <div>
        {
          tableData ? this.renderTable() : <LoadingGauge />
        }
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

CommunityRiskTable.propTypes = {
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  riskType: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  strategyId: PropTypes.number.isRequired,
};

export default CommunityRiskTable;
