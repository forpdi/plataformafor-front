import _ from 'underscore';

import riskTypeEnum from 'forpdi/src/forrisco/enums/riskType';
import preventiveActionState from 'forpdi/src/forrisco/enums/preventiveActionState';
import { mapArrayGrouping } from 'forpdi/src/utils/util';

export function filterPreventiveActionData(
  actions, riskIds = [-1], unitIds = [-1], riskTypeId = -1,
) {
  const total = actions ? actions.length : 0;

  const data = _.map(
    preventiveActionState.list,
    ({
      id, color, label, actionAccomplished,
    }) => {
      const filteredActions = filterActions(
        actions, actionAccomplished, riskIds, unitIds, riskTypeId,
      );

      const quantity = filteredActions.length;
      const percent = total > 0
        ? (quantity / total * 100).toFixed(2)
        : 0;

      return ({
        id,
        color,
        label,
        quantity,
        percent,
        actions: filteredActions,
      });
    },
  );

  return data;
}

function filterActions(actions, actionAccomplished, riskIds, unitIds, riskTypeId) {
  const expression = ({
    riskId, riskType, unitId, accomplished,
  }) => (
    accomplished === actionAccomplished
    && (riskIds.includes(-1) || riskIds.includes(riskId))
    && (unitIds.includes(-1) || unitIds.includes(unitId))
    && (riskTypeId === -1 || riskTypeEnum[riskTypeId].name === riskType)
  );

  return _.filter(actions, expression);
}

export function getMappedPreventiveAction(elements, getKey) {
  const mappedByRisk = mapArrayGrouping(elements, getKey);
  const mappedByRiskVector = Object.entries(mappedByRisk);
  return mappedByRiskVector.map(item => ({
    risk: item[0],
    preventiveActions: item[1],
  }));
}
