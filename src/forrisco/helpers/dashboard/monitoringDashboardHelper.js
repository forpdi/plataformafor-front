import _ from 'underscore';

import { getMaxMonthIfCurrentYearOrNumOfMonths, getYearFromDateTime } from 'forpdi/src/utils/dateUtil';
import riskState from 'forpdi/src/forrisco/enums/riskState';
import months from 'forpdi/src/enums/months';
import { mapArrayGrouping } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';
import riskType from 'forpdi/src/forrisco/enums/riskType';

const staticOptions = {
  hAxis: {
    title: Messages.get('label.time'),
  },
  vAxis: {
    title: Messages.get('label.risks'),
  },
};

export function getMonitoringData(risks, riskIds, unitIds, riskTypeId = -1, year = -1, strategyId = -1) {
  const total = risks.length;

  const data = _.map(
    riskState.list,
    ({ id, color, label }) => {
      const filteredRisks = filterRisks(risks, id, riskIds, unitIds, riskTypeId, year, strategyId);
      const quantity = filteredRisks.length;
      const percent = total > 0
        ? (quantity / total * 100).toFixed(2)
        : 0;

      return ({
        id,
        color,
        label,
        quantity,
        percent,
        risks: filteredRisks,
      });
    },
  );

  return data;
}

function filterRisks(risks, stateId, riskIds, unitIds, riskTypeId, year, strategyId) {
  const expression = ({
    id, begin, unitId, type, monitoringState, strategies,
  }) => (
    monitoringState === stateId
    && (year === -1 || getYearFromDateTime(begin) === year)
    && (riskIds.includes(-1) || riskIds.includes(id))
    && (unitIds.includes(-1) || unitIds.includes(unitId))
    && (riskTypeId === -1 || riskType[riskTypeId].name === type)
    && (strategyId === -1 || strategies.list.find(strategy => strategy.structureId === strategyId))
  );

  return _.filter(risks, expression);
}

export function getChartDataAndOptions(monitorHistoryList, unitIds, year, selectedStateNames) {
  const filteredHistory = filterHistory(monitorHistoryList, unitIds, year, selectedStateNames);

  const mappedByMonth = mapArrayGrouping(filteredHistory, ({ month }) => month - 1);

  const chartData = getChartData(selectedStateNames, mappedByMonth, year);

  const options = {
    ...staticOptions,
    colors: getColors(selectedStateNames),
  };

  return { chartData, options };
}

function filterHistory(monitorHistoryList, unitIds, year, selectedStateNames) {
  return _.filter(
    monitorHistoryList,
    ({
      year: historyYear,
      unitId,
      estado,
    }) => (
      historyYear === year
        && (unitIds.find(el => el === -1) || unitIds.find(el => el === unitId))
        && selectedStateNames.includes(estado)
    ),
  );
}

function getChartData(selectedStateNames, historyMappedByMonth, year) {
  const headerTuple = [
    Messages.get('label.month'), ...selectedStateNames];

  const chartData = [headerTuple];

  const maxMonth = getMaxMonthIfCurrentYearOrNumOfMonths(year);
  const filteredMonths = _.filter(months.list, ({ value }) => value <= maxMonth);

  _.forEach(filteredMonths, ({ value, acronym }) => {
    const monthHistoryList = historyMappedByMonth[value] || [];
    const tuple = [acronym];
    chartData.push(tuple);
    _.forEach(selectedStateNames, (stateName) => {
      const quantitySum = _.reduce(
        monthHistoryList,
        (sum, { quantity, estado }) => (
          estado === stateName ? sum + quantity : sum
        ),
        0,
      );
      tuple.push(quantitySum);
    });
  });

  return chartData;
}

function getColors(selectedStateNames) {
  const filtered = _.filter(riskState.list, ({ name }) => selectedStateNames.includes(name));
  return _.map(filtered, ({ color }) => color);
}
