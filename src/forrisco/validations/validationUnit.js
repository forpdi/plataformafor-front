import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationUnit = (data, onSuccess, component) => {
  const errors = {};

  const {
    name, abbreviation, planRisk, user,
  } = data;

  if (
    name === undefined
      || name.trim() === ''
  ) {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (
    abbreviation === undefined
      || abbreviation.trim() === ''
  ) {
    errors.abbreviation = Messages.get('label.alert.fieldEmpty');
  }

  if (!planRisk.id) {
    errors.planRiskId = Messages.get('label.alert.fieldNotselected');
  }

  if (!user.id) {
    errors.userId = Messages.get('label.alert.fieldNotselected');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationUnit;
