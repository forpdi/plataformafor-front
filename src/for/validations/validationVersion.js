import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';
import { validateDate } from 'forpdi/src/utils/dateUtil';

const validationVersion = (data, onSuccess, component) => {
  const errors = {};
  const {
    numberVersion,
    releaseDate,
    infoFor,
    infoPdi,
    infoRisco,
  } = data;

  if (!numberVersion || numberVersion.trim() === '') {
    errors.numberVersion = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateDate(releaseDate)) {
    errors.releaseDate = Messages.get('label.alert.fieldEmpty');
  }

  if ((!infoFor || infoFor.trim() === '')
  && (!infoPdi || infoPdi.trim() === '')
  && (!infoRisco || infoRisco.trim() === '')) {
    errors.richText = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationVersion;
