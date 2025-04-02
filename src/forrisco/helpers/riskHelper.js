import _ from 'underscore';

import riskType from 'forpdi/src/forrisco/enums/riskType';
import { otherTypologyLabel } from 'forpdi/src/forrisco/enums/typologies';
import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels.json';
import Messages from 'forpdi/src/Messages';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';

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
  return response && riskResponseEnum[response].id === riskResponseEnum.share.id;
}
