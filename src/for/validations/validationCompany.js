import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationCompany = (data, onSuccess, component) => {
  const errors = {};
  const {
    name,
    initials,
    countyId,
  } = data;

  if (!name || name.trim() === '') {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (!initials || initials.trim() === '') {
    errors.initials = Messages.get('label.alert.fieldEmpty');
  }

  if (!countyId) {
    errors.countyId = Messages.get('label.alert.fieldEmpty');
    errors.uf = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationCompany;
