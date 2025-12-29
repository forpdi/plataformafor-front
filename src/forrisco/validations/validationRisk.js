import _ from 'underscore';

import Messages from 'forpdi/src/Messages';

import { existsCheckedOthers } from 'forpdi/src/forrisco/helpers/riskHelper';
import validationHandler from 'forpdi/src/validations/validationHandler';

const validationNewRisk = (data, onSuccess, component) => {
  const errors = getErrors(data);

  validationHandler(errors, onSuccess, component);
};

export function getErrors(data) {
  const {
    name,
    userId,
    managerId,
    reason,
    probability,
    impact,
    periodicity,
    type,
    checkedTypologies,
    otherTypologies,
  } = data;
  const errors = {};

  const checkedOthers = existsCheckedOthers(checkedTypologies);

  if (!name || name.trim() === '') {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (userId === undefined) {
    errors.userId = Messages.get('label.alert.fieldEmpty');
  }

  if (managerId === undefined) {
    errors.managerId = Messages.get('label.alert.fieldEmpty');
  }

  if (!reason || reason.trim() === '') {
    errors.reason = Messages.get('label.alert.fieldEmpty');
  }

  if (probability === '' || probability === undefined) {
    errors.probability = Messages.get('label.alert.fieldEmpty');
  }

  if (impact === '' || impact === undefined) {
    errors.impact = Messages.get('label.alert.fieldEmpty');
  }

  if (periodicity === '' || periodicity === undefined) {
    errors.periodicity = Messages.get('label.alert.fieldEmpty');
  }

  if (type === '' || type === undefined) {
    errors.type = Messages.get('label.alert.fieldEmpty');
  }

  if (!(checkedTypologies && checkedTypologies.length > 0)) {
    errors.checkedTypologies = Messages.get('label.alert.fieldEmpty');
  }

  if (checkedOthers) {
    if (otherTypologies === '') {
      errors.otherTypologies = Messages.get('label.alert.fieldEmpty');
    }
  }

  return errors;
}

export const validationActivities = (activities, onSuccess, component) => {
  const errors = {};

  _.forEach(activities, ({ name }, idx) => {
    if (!name) {
      errors[`activities${idx}`] = Messages.get('label.alert.fieldEmpty');
    }
  });

  validationHandler(errors, onSuccess, component);
};

export default validationNewRisk;
