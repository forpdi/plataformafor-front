import Messages from 'forpdi/src/Messages';
import _ from 'underscore';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationUnit = (data, onSuccess, component) => {
  const errors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  _.forEach(data.allObjectives, ({ description }) => {
    if (!description || description.trim() === '') {
      errors.allObjectives = Messages.get('label.alert.fieldEmpty');
    }
  });

  validationHandler(errors, onSuccess, component);
};

export default validationUnit;
