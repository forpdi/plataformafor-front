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
    let probabilityIndices; let impactIndices;

    // Se -1 => TODOS
    if (risk.probability === -1) {
      probabilityIndices = _.range(nRows);
    } else {
      const idx = probabilities.indexOf(risk.probability);
      probabilityIndices = idx >= 0 ? [idx] : [];
    }

    if (risk.impact === -1) {
      impactIndices = _.range(nCols);
    } else {
      const idx = impacts.indexOf(risk.impact);
      impactIndices = idx >= 0 ? [idx] : [];
    }

    probabilityIndices.forEach((pIdx) => {
      impactIndices.forEach((iIdx) => {
        const currentCell = countMatrix[pIdx][iIdx];
        currentCell.count += 1;
        currentCell.risks.push(risk);
      });
    });
  });

  return countMatrix;
}
