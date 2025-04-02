import _ from 'underscore';

import { getMaxMonthIfCurrentYearOrNumOfMonths } from 'forpdi/src/utils/dateUtil';
import { mapArrayGrouping } from 'forpdi/src/utils/util';
import riskTypeEnum from 'forpdi/src/forrisco/enums/riskType';
import riskLevelColors from 'forpdi/src/forrisco/enums/riskLevelColors';
import months from 'forpdi/src/enums/months';
import Messages from 'forpdi/src/Messages';

const staticOptions = {
  hAxis: {
    title: Messages.get('label.time'),
  },
  vAxis: {
    title: Messages.get('label.risks'),
  },
};

export function getChartDataAndOptions(riskHistoryList, riskLevels, unitIds, year, ristTypeId) {
  const riskLevelIds = _.map(riskLevels, ({ id }) => id);

  const filteredHistory = filterHistory(riskHistoryList, riskLevelIds, unitIds, year, ristTypeId);

  const mappedByMonth = mapArrayGrouping(filteredHistory, ({ month }) => month - 1);

  const chartData = getChartData(riskLevels, mappedByMonth, year);

  const options = {
    ...staticOptions,
    colors: _.map(riskLevels, ({ color }) => riskLevelColors[color].hex),
  };

  return { chartData, options };
}

function filterHistory(riskHistoryList, riskLevelIds, unitIds, year, ristTypeId) {
  const isFilteringThreat = ristTypeId === riskTypeEnum.threat.id;
  return _.filter(
    riskHistoryList,
    ({
      year: historyYear,
      unitId,
      threat,
      riskLevelId,
    }) => (
      historyYear === year
        && (unitIds.find(el => el === -1) || unitIds.find(el => el === unitId))
        && threat === isFilteringThreat
        && riskLevelIds.includes(riskLevelId)
    ),
  );
}

function getChartData(riskLevels, historyMappedByMonth, year) {
  const headerTuple = [Messages.get('label.month'), ..._.map(riskLevels, ({ level }) => level)];
  const chartData = [headerTuple];

  const maxMonth = getMaxMonthIfCurrentYearOrNumOfMonths(year);
  const filteredMonths = _.filter(months.list, ({ value }) => value <= maxMonth);

  _.forEach(filteredMonths, ({ value, acronym }) => {
    const monthHistoryList = historyMappedByMonth[value] || [];
    const tuple = [acronym];
    _.forEach(riskLevels, ({ id: riskLevelId }) => {
      const quantitySum = _.reduce(
        monthHistoryList,
        (sum, { quantity, riskLevelId: historyRiskLevelId }) => (
          riskLevelId === historyRiskLevelId ? sum + quantity : sum
        ),
        0,
      );
      tuple.push(quantitySum);
    });

    chartData.push(tuple);
  });

  return chartData;
}

export function getQuantityData(risks, riskLevels, riskType, riskIds, unitIds, riskState, strategyId) {
  const data = {};
  const riskTypeNames = [];
  const riskStates = [];

  _.forEach(riskLevels, (rl) => {
    data[`${rl.id}`] = { ...rl };
  });

  _.forEach(riskType, (type) => {
    riskTypeNames.push(type.name);
  });

  _.forEach(riskState, (state) => {
    riskStates.push(state.id);
  });

  _.forEach(risks, (risk) => {
    const {
      riskLevel, type, unitId, strategies,
    } = risk;

    const strategiesList = [];

    _.forEach(strategies.list, (sl) => {
      strategiesList.push(sl.structureId);
    });

    const { id: riskLevelId } = riskLevel;
    if (riskTypeNames.includes(type)
        && (riskStates.length === 0 || riskStates.includes(risk.monitoringState))
        && (riskIds.includes(-1) || riskIds.includes(risk.id))
        && (unitIds.includes(-1) || unitIds.includes(unitId))
        && (strategyId === -1 || strategiesList.includes(strategyId))) {
      if (!data[riskLevelId].quantity) {
        data[riskLevelId].quantity = 0;
        data[riskLevelId].risks = [];
      }
      data[riskLevelId].quantity += 1;
      data[riskLevelId].risks.push(risk);
    }
  });

  return _.values(data);
}
