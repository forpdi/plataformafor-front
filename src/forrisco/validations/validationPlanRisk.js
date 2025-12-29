import moment from 'moment';

import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationPlanRegister = (data, onSuccess, component) => {
  let validityBegin = data.validityBegin.split(' ');
  validityBegin = moment(validityBegin, 'DD/MM/YYYY').toDate();
  let validityEnd = data.validityEnd.split(' ');
  validityEnd = moment(validityEnd, 'DD/MM/YYYY').toDate();
  const errors = {};

  if (
    data.name === ''
      || data.name === undefined
      || data.name.trim() === ''
  ) {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (Number.isNaN(validityBegin.getDate())) {
    errors.validityBegin = Messages.get('label.alert.fieldEmpty');
  }

  if (Number.isNaN(validityEnd.getDate())) {
    errors.validityEnd = Messages.get('label.alert.fieldEmpty');
  }

  if (validityBegin >= validityEnd) {
    errors.validityEnd = Messages.get('label.endDateMustBeAfterBeginDate');
  }

  if (data.policyId === undefined || data.policyId === '') {
    errors.policyId = Messages.get('label.alert.fieldNotselected');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationPlanRegister;
