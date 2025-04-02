import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';
import { isValidUrl } from 'forpdi/src/utils/urlUtil';

const validationCompanyDomain = (data, onSuccess, component) => {
  const errors = {};
  const {
    baseUrl,
    host,
    companyId,
  } = data;

  if (!host || host.trim() === '') {
    errors.host = Messages.get('label.alert.fieldEmpty');
  }

  if (baseUrl !== undefined && baseUrl !== '' && baseUrl.trim !== '') {
    isValidUrl(baseUrl) || (errors.baseUrl = Messages.get('notification.badUrl'));
  }

  if (!baseUrl || baseUrl.trim() === '') {
    errors.baseUrl = Messages.get('label.alert.fieldEmpty');
  }

  if (companyId === undefined) {
    errors.companyId = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationCompanyDomain;
