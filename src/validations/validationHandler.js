import _ from 'underscore';

import Messages from 'forpdi/src/Messages';
import scrollToError from 'forpdi/src/utils/scrollToErrorUtil';

export default function handler(errors, onSuccess, component) {
  const hasErrors = _.keys(errors).length > 0;

  component.setState({
    errors,
    waitingSubmit: !hasErrors,
  }, () => hasErrors && scrollToError());

  const { context } = component;
  if (hasErrors && context) {
    const { toastr } = context;
    toastr && toastr.addAlertError(Messages.get('label.msg.errorsForm'));
  } else {
    onSuccess();
  }
}
