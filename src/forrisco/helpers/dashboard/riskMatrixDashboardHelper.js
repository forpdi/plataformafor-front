/* eslint-disable import/prefer-default-export */
import _ from 'underscore';

// Get a matrix of risks and count for each probability and impact
export function getCountMatrix(probabilities, impacts, risks) {
  const nRows = probabilities.length;
  const nCols = impacts.length;

  if (!risks) {
    return null;
  }

  const countMatrix = Array(nRows)
    .fill()
    .map(() => Array(nCols)
      .fill()
      .map(() => ({ risks: [], count: 0 })));

  _.forEach(risks, (risk) => {
    const probabilityIndex = probabilities.indexOf(risk.probability);
    const impactIndex = impacts.indexOf(risk.impact);
    const currentCell = countMatrix[probabilityIndex][impactIndex];
    currentCell.count += 1;
    currentCell.risks.push({ name: risk.name, id: risk.id });
  });

  return countMatrix;
}
