import _ from 'underscore';

import riskType from 'forpdi/src/forrisco/enums/riskType';
import { otherTypologyLabel } from 'forpdi/src/forrisco/enums/typologies';
import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels.json';
import Messages from 'forpdi/src/Messages';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevelColors from '../enums/riskLevelColors';

export function probabilityImpactToOptions(data) {
  const options = data ? data.replaceAll('[', '').split(']').filter(n => n) : [];
  return _.map(options, element => (
    { name: element, id: element }
  ));
}

export function riskToData(risk, unit) {
  const {
    checkedStrategies,
    checkedAxes,
    checkedIndicators,
    checkedGoals,
    checkedObjectives,
    activities: activitiesFields,
    checkedTypologies,
    otherTypologies,
    response,
    sharedUnits,
  } = risk;

  const strategies = {
    list: _.map(
      checkedStrategies,
      ({ id }) => ({ structure: { id } }),
    ),
  };

  const axes = {
    list: _.map(
      checkedAxes,
      ({ id }) => ({ structure: { id } }),
    ),
  };

  const indicators = {
    list: _.map(
      checkedIndicators,
      ({ id }) => ({ structure: { id } }),
    ),
  };

  const goals = {
    list: _.map(
      checkedGoals,
      ({ id }) => ({ structure: { id } }),
    ),
  };

  const activities = {
    list: _.map(
      activitiesFields,
      ({ name, process }) => ({ name, process }),
    ),
  };

  const tipology = typologiesArrayToString(checkedTypologies);
  const checkedOthers = existsCheckedOthers(checkedTypologies);

  return {
    ...risk,
    user: { id: parseInt(risk.userId, 10) },
    manager: { id: parseInt(risk.managerId, 10) },
    unit: unit ? { id: unit.id } : null,
    tipology,
    otherTipologies: checkedOthers ? otherTypologies : '',
    strategies,
    axes,
    indicators,
    goals,
    activities,
    processObjectives: _.map(checkedObjectives, ({ id }) => ({ id })),
    response: response || null,
    sharedUnits,
  };
}

export function dataToRisk(data) {
  const {
    user,
    manager,
    strategies,
    axes,
    indicators,
    goals,
    activities,
    tipology,
    otherTipologies,
    sharedUnits,
    response,
    processObjectives,
  } = data;

  return {
    ...data,
    userId: user.id,
    managerId: manager && manager.id,
    checkedStrategies: _.map(
      strategies.list,
      ({ structure }) => ({ id: structure.id, name: structure.name }),
    ),
    checkedAxes: _.map(
      axes.list,
      ({ structure }) => ({ id: structure.id, name: structure.name }),
    ),
    checkedIndicators: _.map(
      indicators.list,
      ({ structure }) => ({ id: structure.id, name: structure.name }),
    ),
    checkedGoals: _.map(
      goals.list,
      ({ structure }) => ({ id: structure.id, name: structure.name }),
    ),
    checkedObjectives: _.map(
      processObjectives,
      ({ processObjective }) => ({
        id: processObjective.id,
        description: processObjective.description,
        process: processObjective.process,
      }),
    ),
    activities: _.map(
      activities.list,
      ({ name, process }) => ({ name, process }),
    ),
    checkedTypologies: typologyStringToMultiSelectOptions(tipology),
    otherTypologies: otherTipologies,
    response,
    sharedUnits: _.map(sharedUnits, ({ id }) => ({ id })),
  };
}

export function getRisksByTypesAndUnit(risks, riskTypes, riskIds = [-1], unitIds, strategyId) {
  const riskIdCondition = (risk) => {
    const { id } = risk;

    return riskIds.includes(-1) || riskIds.includes(id);
  };

  const unitIdCondition = (risk) => {
    const { unitId } = risk;

    return unitIds.includes(-1) || unitIds.includes(unitId);
  };

  const strategyIdCondition = (risk) => {
    const { strategies } = risk;

    return strategyId === -1 || strategies.list.find(strategy => strategy.structureId === strategyId);
  };

  const typeCondition = risk => riskTypes.find(rType => risk.type === rType.label);
  const filteredRisks = _.filter(
    risks,
    risk => riskIdCondition(risk) && unitIdCondition(risk) && typeCondition(risk) && strategyIdCondition(risk),
  );

  return filteredRisks;
}

export function existsCheckedOthers(checkedTypologies) {
  return !!checkedTypologies.find(opt => opt.label === otherTypologyLabel);
}

function typologiesArrayToString(typologies) {
  return _.map(typologies, typology => typology.value)
    .toString()
    .replaceAll(',', ';');
}

export function typologyStringToList(typologyString) {
  return typologyString.split(';');
}

export function typologyStringToFullList(typologyString, otherTypologies) {
  const otherTypologiesList = otherTypologies ? otherTypologies.split(',') : [];

  return typologyStringToList(typologyString)
    .filter(n => n !== otherTypologyLabel)
    .concat(otherTypologiesList);
}

export function typologyStringToMultiSelectOptions(typologyString) {
  const typologyList = typologyStringToList(typologyString);

  return _.map(typologyList, typology => ({ label: typology, value: typology }));
}

export function getUpdatedLinkFpdi(item) {
  const { linkFPDI, processObjective, process } = item;
  if (!linkFPDI) {
    return null;
  }

  let link = linkFPDI
    .replace('#', '');

  if (processObjective || process) {
    link = link
      .replace('info', 'processes')
      .replace(/plan-risk\/[0-9]+\//, '');
  }
  return link;
}

export function getRiskTypesById(riskTypeId) {
  if (riskTypeId === -1) return riskType.list;

  return [riskType[riskTypeId]];
}

export function getManagerDisplayName(manager) {
  return manager ? manager.name : Messages.get('label.managerNotInformed');
}

export function isResponsibleForItemOrRiskOrHasPermission(itemData, risk, hasPermission) {
  return isResponsible(itemData) || isResponsible(risk) || hasPermission;
}

export function filterManagersFromUsers(users) {
  return users.filter(({ accessLevel }) => accessLevel >= AccessLevels.enum.MANAGER
    && accessLevel <= AccessLevels.enum.ADMIN);
}

export function shouldDisplayUnitsToShare(response) {
  return response && (riskResponseEnum[response].id === riskResponseEnum.share.id || riskResponseEnum[response].id === riskResponseEnum.transfer.id);
}

function matrixStringToProbabilityImpactRiskLevel(matrixString) {
  if (!matrixString) {
    return { probabilities: [], impacts: [], riskLevelsMatrix: [] };
  }
  const splitedCells = matrixString.split(';').filter(Boolean);
  if (splitedCells.length === 0) {
    return { probabilities: [], impacts: [], riskLevelsMatrix: [] };
  }
  const lastCellIndex = splitedCells.length - 1;
  const lastCell = splitedCells[lastCellIndex];

  const rowStringIndex = 1;
  const colStringIndex = 3;
  const labelStringInitialIndex = 5;

  const nRows = parseInt(lastCell[rowStringIndex], 10);
  const nCols = parseInt(lastCell[colStringIndex], 10);

  const firstColIndex = 0;
  const lastRowIndex = nRows;

  const result = {
    probabilities: [],
    impacts: [],
    riskLevelsMatrix: Array(nRows).fill().map(() => Array(nCols).fill('')),
  };

  _.forEach(splitedCells, (cell) => {
    const row = parseInt(cell[rowStringIndex], 10);
    const col = parseInt(cell[colStringIndex], 10);
    const label = cell.slice(labelStringInitialIndex).trim();

    if (col === firstColIndex) {
      result.probabilities.push(label);
    } else if (row === lastRowIndex) {
      result.impacts.push(label);
    } else if (result.riskLevelsMatrix[row]) {
      result.riskLevelsMatrix[row][col - 1] = label;
    }
  });

  return result;
}

export function getClassificationNameFromPolicy(policy, probability, impact) {
  if (!policy || !policy.matrix || !probability || !impact) {
    return null;
  }

  const {
    probabilities,
    impacts,
    riskLevelsMatrix,
  } = matrixStringToProbabilityImpactRiskLevel(policy.matrix);

  const rowIndex = _.findIndex(probabilities, label => label.trim() === probability.trim());
  const colIndex = _.findIndex(impacts, label => label.trim() === impact.trim());

  if (rowIndex === -1 || colIndex === -1) {
    return null;
  }

  if (riskLevelsMatrix[rowIndex] && riskLevelsMatrix[rowIndex][colIndex]) {
    return riskLevelsMatrix[rowIndex][colIndex];
  }

  return null;
}

export function getDynamicColorForClassification(classificationName, riskLevels) {
  if (!classificationName || !riskLevels) {
    return null;
  }
  const foundLevel = _.find(riskLevels, level => level.level.trim() === classificationName.trim());

  if (!foundLevel) {
    return null;
  }
  const colorId = foundLevel.color;
  const colorDetails = _.find(riskLevelColors.list, color => color.id === colorId);

  return colorDetails ? colorDetails.hex : null;
}

export function getColorHexById(colorId) {
  if (colorId === null || typeof colorId === 'undefined') {
    return null;
  }
  const colorDetails = _.find(riskLevelColors.list, color => color.id === colorId);

  return colorDetails ? colorDetails.hex : null;
}
