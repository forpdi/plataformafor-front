import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';
import {
  validateStrongPassword,
  validateCpf,
  validatePhone,
  validateEmail,
  validateEveryWordCapitalized,
} from 'forpdi/src/utils/util';


const validationUser = (
  data,
  cpfChanged,
  passwordChanged,
  isUserProfile,
  onSuccess,
  component,
) => {
  const errors = {};

  const {
    name,
    email,
    cpf,
    cellphone,
    phone,
    currentPassword,
    newPassword,
    newPasswordTwo,
  } = data;

  if (name === undefined || name.trim() === '') {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (!validateEveryWordCapitalized(name)) {
    errors.name = Messages.get('label.wordsNotCapitalized');
  }

  if (!validateEmail(email)) {
    errors.email = Messages.get('label.emailInvalid');
  }

  if (cpfChanged) {
    if (cpf === undefined || cpf.trim() === '') {
      errors.cpf = Messages.get('label.alert.fieldEmpty');
    }
    if (!validateCpf(cpf)) {
      errors.cpf = Messages.get('label.cpfInvalid');
    }
  }

  if (!cellphone) {
    errors.cellphone = Messages.get('label.alert.fieldEmpty');
  } else if (!validatePhone(cellphone)) {
    errors.cellphone = Messages.get('label.invalidPhone');
  }

  if (phone && !validatePhone(phone)) {
    errors.phone = Messages.get('label.invalidPhone');
  }

  if (passwordChanged) {
    if (!validateStrongPassword(newPassword)) {
      errors.newPassword = Messages.get('label.notStrongPassword');
    } else if (newPassword !== newPasswordTwo) {
      errors.newPasswordTwo = Messages.get('label.passwordNotMatch');
    }
    if (!currentPassword && isUserProfile) {
      errors.currentPassword = Messages.get('label.alert.fieldEmpty');
    }
    if (!newPassword) {
      errors.newPassword = Messages.get('label.alert.fieldEmpty');
    }
  }

  validationHandler(errors, onSuccess, component);
};


export default validationUser;
