import Messages from 'forpdi/src/Messages';
import { validateDate, validateDateBeginAndEnd } from 'forpdi/src/utils/dateUtil';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationPreventiveAction = (data, onSuccess, component) => {
  const {
    action,
    accomplished,
    userId,
    managerId,
    file,
  } = data;
  const errors = {};


  if (!action || action.trim() === '') {
    errors.action = Messages.get('label.alert.fieldEmpty');
  }


  if (validateDate(data.validityBegin) && !validateDate(data.validityEnd)) {
    errors.validityEnd = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(data.validityBegin) && validateDate(data.validityEnd)) {
    errors.validityBegin = Messages.get('label.alert.fieldEmpty');
  }

  if (validateDateBeginAndEnd(data.validityBegin, data.validityEnd)) {
    errors.validityEnd = Messages.get('label.endDateMustBeAfterBeginDate');
  }

  if (accomplished === '') {
    errors.accomplished = Messages.get('label.alert.fieldEmpty');
  }

  if (accomplished && !file) {
    errors.file = Messages.get('label.required.attachment.preventiveAction');
  }

  if (userId === undefined) {
    errors.userId = Messages.get('label.alert.fieldEmpty');
  }

  if (managerId === undefined) {
    errors.managerId = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationPreventiveAction;
