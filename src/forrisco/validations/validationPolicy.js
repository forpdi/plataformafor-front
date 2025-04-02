import _ from 'underscore';

import { getFullMatrixDimensions } from 'forpdi/src/forrisco/helpers/policyHelper';
import { getDuplications } from 'forpdi/src/utils/util';
import { validateDate, validateDateBeginAndEnd } from 'forpdi/src/utils/dateUtil';
import Messages from 'forpdi/src/Messages';

const validationPolicy = (data) => {
  const {
    errors: newPolicyFormErrors,
    hasErrors: hasNewPolicyFormErrors,
  } = validateNewPolicyForm(data);

  const {
    errors: probabilityImpactErrors,
    hasErrors: hasPropbabilityImpactErrors,
  } = validateProbabiltyAndImpacts(data);

  const {
    errors: matrixErrors,
    hasErrors: hasMatrixErrors,
  } = validateMatrix(data);

  const errors = {
    ...newPolicyFormErrors,
    ...probabilityImpactErrors,
    ...matrixErrors,
  };

  return {
    errors,
    hasNewPolicyFormErrors,
    hasPropbabilityImpactErrors,
    hasMatrixErrors,
  };
};

export function validateNewPolicyForm(data) {
  const errors = {};

  if (
    data.name === ''
      || data.name === undefined
      || data.name.trim() === ''
  ) {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(data.validityBegin)) {
    errors.validityBegin = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(data.validityEnd)) {
    errors.validityEnd = Messages.get('label.alert.fieldEmpty');
  }

  if (validateDateBeginAndEnd(data.validityBegin, data.validityEnd)) {
    errors.validityEnd = Messages.get('label.endDateMustBeAfterBeginDate');
  }

  const hasErrors = _.keys(errors).length > 0;

  return { errors, hasErrors };
}

export function validateProbabiltyAndImpacts(data) {
  const { probabilities, impacts, riskLevels } = data;

  const errors = {
    ...validateNameDuplications(probabilities, 'probabilityName'),
    ...validateNameDuplications(impacts, 'impactName'),
    ...validateNameDuplications(riskLevels, 'riskLevelName'),
  };

  _.forEach(probabilities, ({ name, description }, index) => {
    if (!name || name.trim() === '') {
      errors[`probabilityName${index}`] = Messages.get('label.alert.fieldEmpty');
    }
    if (!description || description.trim() === '') {
      errors[`probabilityDescription${index}`] = Messages.get('label.alert.fieldEmpty');
    }
  });

  _.forEach(impacts, ({ name, description }, index) => {
    if (!name || name.trim() === '') {
      errors[`impactName${index}`] = Messages.get('label.alert.fieldEmpty');
    }
    if (!description || description.trim() === '') {
      errors[`impactDescription${index}`] = Messages.get('label.alert.fieldEmpty');
    }
  });

  _.forEach(riskLevels, ({ name, colorId }, index) => {
    if (!name || name.trim() === '') {
      errors[`riskLevelName${index}`] = Messages.get('label.alert.fieldEmpty');
    }
    if (colorId === null || colorId === undefined) {
      errors[`riskLevelColorId${index}`] = Messages.get('label.alert.fieldEmpty');
    }
  });

  const hasErrors = _.keys(errors).length > 0;

  return { errors, hasErrors };
}

function validateNameDuplications(values, fieldName) {
  const errors = {};

  const names = _.map(values, p => p.name);
  const duplicatedNames = getDuplications(names);

  _.forEach(names, (name, idx) => {
    if (duplicatedNames.includes(name)) {
      errors[`${fieldName}${idx}`] = Messages.get('label.alert.duplicatedInfo');
    }
  });

  return errors;
}

function validateMatrix(data) {
  const { matrix, probabilities, impacts } = data;

  const { nRows, nCols } = getFullMatrixDimensions(probabilities, impacts);

  const duplicatedErrors = getDuplicatedMatrixErrors(nRows, nCols, matrix);
  const emptyMatrixErrors = getEmptyMatrixErrors(nRows, nCols, matrix);

  const errors = {};

  if (hasRiskMatrixErrors(duplicatedErrors)) {
    errors.matrixInputs = duplicatedErrors;
    errors.matrixErrorMsg = Messages.get('label.mustNotRepeatProbabilityImpact');
  }

  if (hasRiskMatrixErrors(emptyMatrixErrors)) {
    errors.matrixInputs = emptyMatrixErrors;
    errors.matrixErrorMsg = Messages.get('label.mustFillRiskMatrix');
  }

  const hasErrors = _.keys(errors).length > 0;

  return { errors, hasErrors };
}

const getEmptyMatrixErrors = (nRows, nCols, matrix) => {
  let riskMatrixErrors = Array(nRows).fill().map(() => Array(nCols).fill(null));
  // Any input empty
  const isEmpty = (row, col) => (
    matrix[row][col] === ''
  );
  riskMatrixErrors = matrixValidator(riskMatrixErrors, isEmpty);
  return riskMatrixErrors;
};

const getDuplicatedMatrixErrors = (nRows, nCols, matrix) => {
  const firstColIndex = 0;
  const lastRowIndex = nRows - 1;
  let riskMatrixErrors = Array(nRows).fill().map(() => Array(nCols).fill(null));

  // Duplicated probabilities
  const probabilities = _.map(matrix, row => (
    row[firstColIndex]
  ));
  const duplicatedProbabilitiesIndex = getDuplicatedIndex(probabilities);
  const isProbabilityDuplicated = (row, col) => (
    duplicatedProbabilitiesIndex.includes(row) && col === firstColIndex
  );

  // Duplicated impacts
  const impacts = matrix[lastRowIndex];
  const duplicatedImpactsIndex = getDuplicatedIndex(impacts);
  const isImpactDuplicated = (row, col) => (
    duplicatedImpactsIndex.includes(col) && row === lastRowIndex
  );

  riskMatrixErrors = matrixValidator(riskMatrixErrors, (row, col) => (
    isImpactDuplicated(row, col) || isProbabilityDuplicated(row, col)
  ));

  return riskMatrixErrors;
};

const isLeftBottomMatrixInput = (row, col, lastRowIndex) => {
  const firstColIndex = 0;
  return col === firstColIndex && row === lastRowIndex;
};

const hasRiskMatrixErrors = (riskMatrixErrors) => {
  const nRows = riskMatrixErrors.length;
  const nCols = riskMatrixErrors[0].length;
  for (let row = 0; row < nRows; row += 1) {
    for (let col = 0; col < nCols; col += 1) {
      if (riskMatrixErrors[row][col] !== null) {
        return true;
      }
    }
  }
  return false;
};

const matrixValidator = (riskMatrixErrors, condition) => {
  const nRows = riskMatrixErrors.length;
  const nCols = riskMatrixErrors[0].length;
  const lastRowIndex = nRows - 1;
  const newRiskMatrixErrors = riskMatrixErrors;
  for (let row = 0; row < nRows; row += 1) {
    for (let col = 0; col < nCols; col += 1) {
      if (condition(row, col)
        && !isLeftBottomMatrixInput(row, col, lastRowIndex)
      ) {
        newRiskMatrixErrors[row][col] = 'error';
      }
    }
  }
  return newRiskMatrixErrors;
};

const getDuplicatedIndex = (array) => {
  const elementCount = {};
  _.forEach(array, (element, index) => {
    if (elementCount[element]) {
      elementCount[element].push(index);
    } else {
      elementCount[element] = [index];
    }
  });

  const values = _.values(elementCount);
  const index = _.reduce(values, (duplicatedIndexes, currentElement) => {
    let newDuplicatedIndexes = duplicatedIndexes;
    if (currentElement.length > 1) {
      newDuplicatedIndexes += currentElement;
    }
    return newDuplicatedIndexes;
  }, []);
  return index;
};

export default validationPolicy;
