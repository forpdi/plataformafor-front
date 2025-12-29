import _ from 'underscore';

import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationItem = (data, onSuccess, component) => {
  const errors = {};

  if (
    data.name === undefined
      || data.name.trim() === ''
  ) {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  _.forEach(data.itemFields, ({ name, fieldId }, index) => {
    if (!name || name.trim() === '') {
      errors[`itemFields${index}name`] = Messages.get('label.alert.fieldEmpty');
    }
    if (!fieldId || fieldId.trim() === '') {
      errors[`itemFields${index}fieldId`] = Messages.get('label.alert.fieldEmpty');
    }
  });

  validationHandler(errors, onSuccess, component);
};

export default validationItem;
