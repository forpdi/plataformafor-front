import _ from 'underscore';
import React from 'react';

import {
  getYearFromDateTime,
  getMonthFromDateTime,
  getMaxMonthIfCurrentYearOrNumOfMonths,
} from 'forpdi/src/utils/dateUtil';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import months from 'forpdi/src/enums/months';
import Messages from 'forpdi/src/Messages';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';
import Modal from 'forpdi/src/components/modals/Modal';

import { htmlStringToSimpleText } from 'forpdi/src/utils/util';

const staticOptions = {
  hAxis: {
    title: Messages.get('label.time'),
  },
  vAxis: {
    title: Messages.get('label.quantity'),
  },
};

const threatsLabel = riskType.threat.pluralLabel.toLowerCase();
const opportunitiesLabel = riskType.opportunity.pluralLabel.toLowerCase();

export function getChartDataAndOptions(
  selectedYear,
  riskIds,
  unitIds,
  incidents,
  opportunitiesChecked,
  threatsChecked,
) {
  const filteredIncidents = filterIncidents(incidents, selectedYear, riskIds, unitIds);

  const chartData = getChartData(
    filteredIncidents, opportunitiesChecked, threatsChecked, selectedYear,
  );

  const options = getChartOptions(chartData, opportunitiesChecked, threatsChecked);

  return { chartData, options };
}

export const onChartClick = (
  month, typeId, selectedYear, selectedUnitIds, selectedRiskIds, incidents, router, hideEye = false,
) => {
  const filteredIncidents = filterIncidents(
    incidents,
    selectedYear,
    selectedRiskIds,
    selectedUnitIds,
    month,
    typeId,
  );

  const modal = (
    <DashboardItemsModal
      heading={Messages.get('label.incidents')}
      subHeading={`${Messages.get('label.type')} ${riskType[typeId].name}`}
      items={_.map(filteredIncidents, ({ description, id, riskId }) => (
        { description: htmlStringToSimpleText(description), incidentId: id, riskId }
      ))}
      onClick={({ incidentId, riskId }) => router.push(`/forrisco/risk/${riskId}/incident/${incidentId}/info`)}
      hideEye={hideEye}
    />
  );

  Modal.show(modal);
};

export function filterIncidents(incidents, year, riskIds, unitIds, month, typeId) {
  const expression = ({
    begin, unitId, type: incidentTypeId, riskId,
  }) => (
    (year === -1 || getYearFromDateTime(begin) === year)
    && (riskIds.includes(-1) || riskIds.includes(riskId))
    && (unitIds.includes(-1) || unitIds.includes(unitId))
    && (month === undefined || month === -1 || month === getMonthFromDateTime(begin))
    && (typeId === undefined || typeId === -1 || typeId === incidentTypeId)
  );

  return _.filter(incidents, expression);
}

function getChartData(incidents, opportunitiesChecked, threatsChecked, selectedYear) {
  const opportunitiesCounter = countIncidentTypeByMonth(incidents, riskType.opportunity.id);
  const threatsCounter = countIncidentTypeByMonth(incidents, riskType.threat.id);
  const maxMonth = getMaxMonthIfCurrentYearOrNumOfMonths(selectedYear);

  const chartData = [];
  if (opportunitiesChecked && threatsChecked) {
    chartData.push([Messages.get('label.month'), threatsLabel, opportunitiesLabel]);
    iterateMonths(maxMonth, (month) => {
      const numThreats = threatsCounter[month] || 0;
      const numOpportunities = opportunitiesCounter[month] || 0;
      chartData.push([months[month].acronym, numThreats, numOpportunities]);
    });
  } else if (opportunitiesChecked) {
    chartData.push([Messages.get('label.month'), opportunitiesLabel]);
    iterateMonths(maxMonth, (month) => {
      const numOpportunities = opportunitiesCounter[month] || 0;
      chartData.push([months[month].acronym, numOpportunities]);
    });
  } else if (threatsChecked) {
    chartData.push([Messages.get('label.month'), threatsLabel]);
    iterateMonths(maxMonth, (month) => {
      const numThreats = threatsCounter[month] || 0;
      chartData.push([months[month].acronym, numThreats]);
    });
  } else {
    throw Error('Unexpected state: opportunities and threats not checked');
  }

  return chartData;
}

function iterateMonths(maxMonth, callback) {
  for (let month = 0; month <= maxMonth; month += 1) {
    callback(month);
  }
}

function countIncidentTypeByMonth(incidents, typeId) {
  const counter = {};
  _.forEach(incidents, ({ begin, type: incidentTypeId }) => {
    if (typeId === incidentTypeId) {
      const month = `${getMonthFromDateTime(begin)}`;
      if (!counter[month]) {
        counter[month] = 0;
      }
      counter[month] += 1;
    }
  });

  return counter;
}

export function getChartOptions(chartData, opportunitiesChecked, threatsChecked) {
  return {
    ...staticOptions,
    colors: getChartColors(opportunitiesChecked, threatsChecked),
  };
}

function getChartColors(opportunitiesChecked, threatsChecked) {
  const colors = [];

  if (threatsChecked) {
    colors.push(riskType.threat.color);
  }
  if (opportunitiesChecked) {
    colors.push(riskType.opportunity.color);
  }

  return colors;
}
