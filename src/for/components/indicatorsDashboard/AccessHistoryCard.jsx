import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import moment from 'moment';

import ForPDIChart from 'forpdi/src/forpdi/core/widget/ForPDIChart';
import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import ExportReportButtons from 'forpdi/src/for/components/ExportReportButtons';

import { dateStrIsSameOrBefore, dateStrIsSameOrAfter, parseIso8601ToDateStr } from 'forpdi/src/utils/dateUtil';


const fpdiAccessIdx = 0;
const friscoAccessIdx = 1;

const fpdiColor = '#1c527b';
const friscoColor = '#d862e1';

const AccessHistoryCard = ({
  companiesAccessHistory,
  beginDate,
  endDate,
  onExportPdf,
  onExportCsv,
}) => {
  function hasAccessHistory(ticks) {
    return ticks.length > 0;
  }

  function getData() {
    const { totalizedHistory, totalFpdiAccess, totalFriscoAccess } = getTotalizedData();

    const data = [['Data', 'PDI', 'RISCOS']];
    const dates = _.sortBy(Object.keys(totalizedHistory));
    const yearMonthsSet = new Set();
    _.forEach(dates, (date) => {
      data.push([moment(date).toDate(), ...totalizedHistory[date]]);
      yearMonthsSet.add(date.slice(0, 7));
    });

    const ticks = getYearMonthTicks(yearMonthsSet);

    const pieChartData = [
      ['Plataforma', 'Acessos'],
      ['PDI', totalFpdiAccess],
      ['RISCOS', totalFriscoAccess],
    ];

    return { data, pieChartData, ticks };
  }

  function getTotalizedData() {
    const totalizedHistory = {};
    let totalFpdiAccess = 0;
    let totalFriscoAccess = 0;
    _.forEach(companiesAccessHistory, (companyHistory) => {
      const { history } = companyHistory;
      const dates = _.keys(history);
      _.forEach(dates, (date) => {
        const parsedDate = parseIso8601ToDateStr(date);
        if ((!beginDate || dateStrIsSameOrAfter(parsedDate, beginDate))
            && (!endDate || dateStrIsSameOrBefore(parsedDate, endDate))) {
          if (!totalizedHistory[date]) {
            totalizedHistory[date] = [0, 0];
          }
          const fpdiAccess = history[date][fpdiAccessIdx];
          const friscoAccess = history[date][friscoAccessIdx];
          totalizedHistory[date][fpdiAccessIdx] += fpdiAccess;
          totalizedHistory[date][friscoAccessIdx] += friscoAccess;
          totalFpdiAccess += fpdiAccess;
          totalFriscoAccess += friscoAccess;
        }
      });
    });

    return { totalizedHistory, totalFpdiAccess, totalFriscoAccess };
  }

  function getYearMonthTicks(yearMonthsSet) {
    const ticks = [];
    yearMonthsSet.forEach((yearMonthStr) => {
      const split = yearMonthStr.split('-');
      ticks.push(new Date(parseInt(split[0], 10), parseInt(split[1], 10) - 1));
    });

    return ticks;
  }

  function renderCharts(data, ticks, pieChartData) {
    return (
      <div className="row">
        {renderPieChart(pieChartData, ticks)}
        {renderLineChart(data, ticks)}
      </div>
    );
  }

  function renderPieChart(pieChartData, ticks) {
    return (
      <div className="col col-sm-6" style={{ display: hasAccessHistory(ticks) ? 'block' : 'none' }}>
        <ForPDIChart
          graph_id="access-history-pie-chart"
          chartType="PieChart"
          data={pieChartData}
          options={{
            pieHole: 0.4,
            is3D: false,
            colors: [fpdiColor, friscoColor],
          }}
          width="100%"
          height="300px"
          legend_toggle={false}
        />
      </div>
    );
  }

  function renderLineChart(data, ticks) {
    return (
      <div className="col col-sm-6" style={{ display: hasAccessHistory(ticks) ? 'block' : 'none' }}>
        <ForPDIChart
          graph_id="access-history-chart"
          chartType="LineChart"
          data={data}
          options={{
            hAxis: {
              title: 'Mês/Ano',
              format: 'MM/YYYY',
              ticks,
            },
            vAxis: {
              title: 'Acessos',
            },
            title: 'Acessos durante o período',
            legend: { position: 'bottom' },
            colors: [fpdiColor, friscoColor],
          }}
          width="100%"
          height="300px"
          legend_toggle={false}
          pageSize={10}
          total={undefined}
          onChangePage={() => { }}
        />
      </div>
    );
  }

  function render() {
    const { data, ticks, pieChartData } = getData();

    return (
      <DashboardCard
        title="Acessos"
      >
        {hasAccessHistory(ticks) && (
          <ExportReportButtons
            onExportPdf={onExportPdf}
            onExportCsv={onExportCsv}
          />
        )}
        {renderCharts(data, ticks, pieChartData)}
        {!hasAccessHistory(ticks) && <p>Não há dados disponíveis</p>}
      </DashboardCard>
    );
  }

  return render();
};

AccessHistoryCard.propTypes = {
  companiesAccessHistory: PropTypes.arrayOf(PropTypes.shape({
    companyId: PropTypes.number,
    history: PropTypes.shape({}),
  })).isRequired,
  beginDate: PropTypes.string,
  endDate: PropTypes.string,
  onExportPdf: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
};


AccessHistoryCard.defaultProps = {
  beginDate: null,
  endDate: null,
};

export default AccessHistoryCard;
