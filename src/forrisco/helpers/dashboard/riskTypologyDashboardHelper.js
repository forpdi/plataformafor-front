import _ from 'underscore';

import { getRisksByTypesAndUnit, typologyStringToList } from 'forpdi/src/forrisco/helpers/riskHelper';
import typologiesEnum from 'forpdi/src/forrisco/enums/typologies';

// eslint-disable-next-line import/prefer-default-export
export function getTipologyData(risks, riskTypes, riskIds, unitIds, strategyId) {
  const data = _.map(
    typologiesEnum.list,
    ({ label, color }) => {
      const filteredRisks = getRisksByTypeUnitAndTypology(
        risks, riskTypes, riskIds, unitIds, label, strategyId,
      );
      const quantity = filteredRisks.length;

      return ({
        color,
        label,
        quantity,
        risks: filteredRisks,
      });
    },
  );

  return data;
}

function getRisksByTypeUnitAndTypology(risks, riskTypes, riskIds, unitIds, typology, strategyId) {
  const newRisks = getRisksByTypesAndUnit(risks, riskTypes, riskIds, unitIds, strategyId);
  return _.reduce(newRisks, (filteredRisks, currentRisk) => {
    const riskTypologies = typologyStringToList(currentRisk.tipology);
    if (riskTypologies.includes(typology)) {
      filteredRisks.push(currentRisk);
    }
    return filteredRisks;
  }, []);
}
