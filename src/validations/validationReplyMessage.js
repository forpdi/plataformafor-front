import Messages from 'forpdi/src/Messages';

import validationHandler from './validationHandler';

const validationReplyMessage = (data, onSuccess, component) => {
  const errors = {};

  if (
    data.subject === undefined
      || data.subject.trim() === ''
  ) {
    errors.subject = Messages.get('label.alert.fieldEmpty');
  }

  if (
    data.message === undefined
      || data.message.trim() === ''
  ) {
    errors.message = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationReplyMessage;
