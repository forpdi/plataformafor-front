import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import ExportReportButtons from 'forpdi/src/for/components/ExportReportButtons';

import { dateStrIsSameOrBefore, dateStrIsSameOrAfter, parseIso8601ToDateStr } from 'forpdi/src/utils/dateUtil';
import Messages from 'forpdi/src/Messages';

const fpdiAccessIdx = 0;
const friscoAccessIdx = 1;

class InstitutionsCard extends React.Component {
  constructor(props) {
    super(props);
    const {
      companiesIndicators,
      companiesAccessHistory,
      beginDate,
      endDate,
    } = props;
    const tableData = this.getTableData(companiesIndicators, companiesAccessHistory, beginDate, endDate);
    this.state = {
      tableData,
    };
  }

  componentWillReceiveProps(newProps) {
    const {
      companiesIndicators,
      companiesAccessHistory,
      beginDate,
      endDate,
    } = newProps;
    const tableData = this.getTableData(companiesIndicators, companiesAccessHistory, beginDate, endDate);
    this.setState({
      tableData,
    });
  }

  getTableData(companiesIndicators, companiesAccessHistory, beginDate, endDate) {
    const companiesTotalizedAccessMap = this.getCompaniesTotalizedAccessMap(companiesIndicators, companiesAccessHistory, beginDate, endDate);
    return _.map(companiesIndicators, ci => ({
      fpdiAccessesCount: companiesTotalizedAccessMap[`${ci.id}`][fpdiAccessIdx],
      friscoAccessesCount: companiesTotalizedAccessMap[`${ci.id}`][friscoAccessIdx],
      ...ci,
    }));
  }

  getCompaniesTotalizedAccessMap(companiesIndicators, companiesAccessHistory, beginDate, endDate) {
    const companiesTotalizedAccessMap = {};
    _.forEach(companiesIndicators, ({ id }) => {
      companiesTotalizedAccessMap[`${id}`] = [0, 0];
    });

    _.forEach(companiesAccessHistory, ({ companyId, history }) => {
      const dates = _.keys(history);
      _.forEach(dates, (dateStr) => {
        const parsedDate = parseIso8601ToDateStr(dateStr);
        if ((!beginDate || dateStrIsSameOrAfter(parsedDate, beginDate))
            && (!endDate || dateStrIsSameOrBefore(parsedDate, endDate))) {
          companiesTotalizedAccessMap[`${companyId}`][fpdiAccessIdx] += history[dateStr][fpdiAccessIdx];
          companiesTotalizedAccessMap[`${companyId}`][friscoAccessIdx] += history[dateStr][friscoAccessIdx];
        }
      });
    });

    return companiesTotalizedAccessMap;
  }

  renderTable() {
    const { beginDate, endDate } = this.props;
    const { tableData } = this.state;

    function renderPeriod() {
      if (beginDate && !endDate) {
        return `A partir de ${beginDate}`;
      }
      if (!beginDate && endDate) {
        return `Até ${endDate}`;
      }

      if (beginDate && endDate) {
        return `${beginDate} à ${endDate}`;
      }

      return '';
    }

    const columns = [
      {
        name: Messages.get('label.initials'),
        field: 'initials',
        width: '7%',
        sort: true,
      },
      {
        name: 'Data de adesão',
        field: 'creation',
        width: '7%',
        sort: Table.getDateSortBy('creation'),
      },
      {
        name: 'Período',
        width: '7%',
        render: renderPeriod,
      },
      {
        name: 'Acessos PDI',
        field: 'fpdiAccessesCount',
        width: '15%',
        sort: Table.getNumberSortBy('fpdiAccessesCount'),
      },
      {
        name: 'Acessos RISCOS',
        field: 'friscoAccessesCount',
        width: '15%',
        sort: Table.getNumberSortBy('friscoAccessesCount'),
      },
      {
        name: 'PDIs Cadastrados',
        field: 'planMacrosCount',
        width: '15%',
        sort: Table.getNumberSortBy('planMacrosCount'),
      },
      {
        name: 'Planos de Risco cadastrados',
        field: 'planRisksCount',
        width: '15%',
        sort: Table.getNumberSortBy('planRisksCount'),
      },
    ];

    return (
      <Table
        data={tableData}
        columns={columns}
      />
    );
  }

  render() {
    const { onExportPdf, onExportCsv } = this.props;

    return (
      <DashboardCard title="Instituições">
        <ExportReportButtons
          onExportPdf={onExportPdf}
          onExportCsv={onExportCsv}
        />
        {this.renderTable()}
      </DashboardCard>
    );
  }
}

InstitutionsCard.propTypes = {
  companiesIndicators: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  beginDate: PropTypes.string,
  endDate: PropTypes.string,
  companiesAccessHistory: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onExportPdf: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
};

InstitutionsCard.defaultProps = {
  beginDate: null,
  endDate: null,
};

export default InstitutionsCard;
