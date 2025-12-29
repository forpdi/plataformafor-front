import Messages from 'forpdi/src/Messages';
import { validateTime, validateDate } from 'forpdi/src/utils/dateUtil';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationNewMonitor = (data, onSuccess, component) => {
  const errors = {};
  const {
    report,
    userId,
    probability,
    impact,
    beginDate,
    beginTime,
    managerId,
  } = data;

  if (!report || report.trim() === '') {
    errors.report = Messages.get('label.alert.fieldEmpty');
  }

  if (userId === undefined) {
    errors.userId = Messages.get('label.alert.fieldEmpty');
  }

  if (managerId === undefined) {
    errors.managerId = Messages.get('label.alert.fieldEmpty');
  }

  if (probability === '' || probability === undefined) {
    errors.probability = Messages.get('label.alert.fieldEmpty');
  }

  if (impact === '' || impact === undefined) {
    errors.impact = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(beginDate)) {
    errors.beginDate = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateTime(beginTime)) {
    errors.beginTime = Messages.get('label.valueInvalidExpected');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationNewMonitor;
