import _ from 'underscore';

export function getUnitTagLabel(unit) {
  if (!unit) {
    return null;
  }

  const { abbreviation, name } = unit;
  return `${abbreviation} - ${name}`;
}

export function filterOnlyUnits(unitsAndSubunits) {
  return _.filter(unitsAndSubunits, ({ parentId }) => !parentId);
}

export function filterOnlySubUnits(unitsAndSubunits) {
  return _.filter(unitsAndSubunits, ({ parentId }) => !!parentId);
}

export function filterSubUnits(unitsAndSubunits, unitParentId) {
  return _.filter(unitsAndSubunits, ({ parentId }) => parentId === unitParentId);
}
