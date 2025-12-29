import Messages from 'forpdi/src/Messages';
import { getYearFromDate } from 'forpdi/src/utils/dateUtil';

import validationHandler from 'forpdi/src/validations/validationHandler';

const yearLimit = 1990;

const validationIncident = (data, onSuccess, component) => {
  const errors = {};

  const {
    userId,
    correctionalActions,
    date,
    time,
    type,
  } = data;

  if (
    userId === undefined
      || userId === null
      || userId === ''
  ) {
    errors.userId = Messages.get('label.alert.fieldNotselected');
  }

  if (
    correctionalActions === undefined
      || correctionalActions.trim() === ''
  ) {
    errors.correctionalActions = Messages.get('label.alert.fieldEmpty');
  }

  if (date === '' || date === undefined) {
    errors.date = Messages.get('label.alert.fieldEmpty');
  } else if (getYearFromDate(date) < yearLimit) {
    errors.date = Messages.get('label.alert.yearLimit');
  }

  if (time === '' || time === undefined) {
    errors.time = Messages.get('label.alert.fieldEmpty');
  }

  if (data.userId === undefined) {
    errors.userId = Messages.get('label.alert.fieldEmpty');
  }

  if (data.managerId === undefined) {
    errors.managerId = Messages.get('label.alert.fieldEmpty');
  }

  if (type === '') {
    errors.type = Messages.get('label.alert.fieldNotselected');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationIncident;
