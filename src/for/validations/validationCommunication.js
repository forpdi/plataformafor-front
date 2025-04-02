import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';
import { validateDate, validateDateBeginAndEnd, validateBeforeActualDate } from 'forpdi/src/utils/dateUtil';

export function validateCommunication(data, onSuccess, component) {
  const errors = {};
  const {
    title,
    message,
    validityBegin,
    validityEnd,
  } = data;

  if (!title || title.trim() === '') {
    errors.title = Messages.get('label.alert.fieldEmpty');
  }

  if (!message || message.trim() === '') {
    errors.message = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(validityBegin)) {
    errors.validityBegin = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateBeforeActualDate(validityBegin)) {
    errors.validityBegin = Messages.get('label.dateBeforeActualData');
  }

  if (validateDateBeginAndEnd(validityBegin, validityEnd)) {
    errors.validityEnd = Messages.get('label.endDateMustBeAfterBeginDate');
  }

  validationHandler(errors, onSuccess, component);
}

export function validateUpdateCommunication(
  validityBegin, newValidityEnd, validityEnd, onSuccess, component,
) {
  const errors = {};

  if (validityEnd != null) {
    if (validateDateBeginAndEnd(validityEnd, newValidityEnd)) {
      errors.validityEnd = Messages.get('label.updateCommunicationError');
    }
  }

  if (validateDateBeginAndEnd(validityBegin, newValidityEnd)) {
    errors.validityEnd = Messages.get('label.endDateMustBeAfterBeginDate');
  }

  validationHandler(errors, onSuccess, component);
}

export default validateCommunication;
