import _ from 'underscore';
import riskLevelColors from 'forpdi/src/forrisco/enums/riskLevelColors';

export function createMatrix(probabilities, impacts) {
  const { nRows, nCols } = getFullMatrixDimensions(probabilities, impacts);

  const matrix = Array(nRows)
    .fill()
    .map(() => Array(nCols).fill(''));
  return matrix;
}

export function getFullMatrixDimensions(probabilities, impacts) {
  const { nRows, nCols } = getMatrixDimensions(probabilities, impacts);

  return {
    nRows: nRows + 1,
    nCols: nCols + 1,
  };
}

export function getMatrixDimensions(probabilities, impacts) {
  return {
    nRows: probabilities.length,
    nCols: impacts.length,
  };
}

export function matrixToString(matrix) {
  let finalString = '';
  _.forEach(matrix, (row, rowIndex) => {
    _.forEach(row, (element, colIndex) => {
      if (element !== '' && element !== undefined) {
        finalString += `[${rowIndex},${colIndex}]${element};`;
      }
    });
  });

  return finalString;
}

export function optionsToString(options) {
  return _.map(options, ({ name }) => `[${name}]`).join('');
}

export function impactsProbabilitiesStringToArray(str) {
  return str
    ? str.replace(/^(?:\[|\])$/g, '').split('][')
    : [];
}

export function formatRiskLevels(riskLevels) {
  return [
    _.map(riskLevels, ({ name }) => name),
    _.map(riskLevels, ({ colorId }) => colorId),
  ];
}

export function getPIdescriptions(probabilities, impacts) {
  const mapper = options => (
    _.map(options, ({ name, description }) => ({ description, value: name }))
  );

  const pdescriptions = mapper(probabilities);
  const idescriptions = mapper(impacts);

  return JSON.stringify({
    PIDescriptions: { pdescriptions, idescriptions },
  });
}

export function convertPIdescriptions(PIdescriptions) {
  const { PIDescriptions } = JSON.parse(PIdescriptions);
  const { pdescriptions, idescriptions } = PIDescriptions;
  return { pdescriptions, idescriptions };
}

export function getPolicyTagLabel(company) {
  if (!company) {
    return null;
  }

  const { description, initials } = company;
  return `${initials} - ${description}`;
}
// Get the data for infoRiskMatrix component
export function getRiskMatrixData(matrix, riskLevels) {
  const {
    probabilities,
    impacts,
    riskLevelsMatrix,
  } = matrixStringToProbabilityImpactRiskLevel(matrix);

  const colorsMatrix = getColorMatrix(riskLevelsMatrix, riskLevels);

  const riskMatrix = toRiskMatrix(probabilities, impacts, riskLevelsMatrix, colorsMatrix);

  return {
    probabilities,
    impacts,
    riskMatrix,
  };
}

// Convert the backend matrix string into a list of probabilities and impacts
// and a matrix of RiskLevel strings
export function matrixStringToProbabilityImpactRiskLevel(matrixString) {
  // Result an array of strings like: '[row,col]Random Name'
  const splitedCells = matrixString.split(';').filter(Boolean);
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
    const label = cell.slice(labelStringInitialIndex);

    if (col === firstColIndex) {
      result.probabilities.push(label);
    } else if (row === lastRowIndex) {
      result.impacts.push(label);
    } else {
      result.riskLevelsMatrix[row][col - 1] = label;
    }
  });

  return result;
}

// Get the colors of each risk level string
export function getColorMatrix(riskLevelsMatrix, riskLevelsList) {
  return _.map(riskLevelsMatrix, row => (
    _.map(row, (level) => {
      const findedRiskLevel = riskLevelsList.find(riskLevel => level === riskLevel.level);
      return riskLevelColors[findedRiskLevel.color].hex;
    })
  ));
}

// Merge the three arg matrix without color
export function riskLevelsMatrixToMatrix(probabilities, impacts, riskLevelsMatrix) {
  const matrix = [];
  _.forEach(riskLevelsMatrix, (row, rowIndex) => {
    matrix.push([probabilities[rowIndex]].concat(row));
  });
  matrix.push([''].concat(impacts));

  return matrix;
}

// Merge the three arg matrix
export function toRiskMatrix(probabilities, impacts, riskLevelsMatrix, colorMatrix) {
  if (!colorMatrix || !riskLevelsMatrix) {
    return null;
  }

  return _.map(riskLevelsMatrix, (row, rowIndex) => (
    _.map(row, (riskLevel, colIndex) => {
      const colorCell = colorMatrix[rowIndex][colIndex];
      const probability = probabilities[rowIndex];
      const impact = impacts[colIndex];
      const resultCell = {
        riskLevel,
        color: colorCell,
        probability,
        impact,
      };

      return resultCell;
    })));
}
