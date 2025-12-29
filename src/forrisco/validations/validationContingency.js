import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';
import { validateDate, validateDateBeginAndEnd } from 'forpdi/src/utils/dateUtil';

const validationContingency = (data, onSuccess, component) => {
  const errors = {};

  if (data.action === undefined || data.action.trim() === '') {
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

  if (data.managerId === undefined) {
    errors.managerId = Messages.get('label.alert.fieldEmpty');
  }

  if (data.userId === '' || data.userId === undefined) {
    errors.userId = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationContingency;
