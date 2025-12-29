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
  } else if (/\s/.test(host)) {
    errors.host = 'O campo Host não pode conter espaços.';
  }

  if (companyId === undefined) {
    errors.companyId = Messages.get('label.alert.fieldEmpty');
  }

  if (!baseUrl || baseUrl.trim() === '') {
    errors.baseUrl = Messages.get('label.alert.fieldEmpty');
  } else if (/\s/.test(baseUrl)) {
    errors.baseUrl = 'A URL base não pode conter espaços.';
  } else if (!isValidUrl(baseUrl)) {
    errors.baseUrl = Messages.get('notification.badUrl');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationCompanyDomain;
