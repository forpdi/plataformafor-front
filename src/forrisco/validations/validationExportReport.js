import Messages from 'forpdi/src/Messages';
import validationHandler from 'forpdi/src/validations/validationHandler';
import { REPORT_TITLE_MAX_LENGTH } from 'forpdi/src/consts';

const validationExportReport = (
  universityName,
  checkedValues,
  onSuccess,
  customValidation,
  component,
) => {
  let errors = {};

  if (!universityName) {
    errors.universityName = Messages.get('label.alert.fieldEmpty');
  } else if (universityName.length > REPORT_TITLE_MAX_LENGTH) {
    errors.universityName = Messages.get('label.max150letters');
  }

  if (!checkedValues || checkedValues.length === 0) {
    errors.checkedValues = Messages.get('label.noSectionSelected');
  }

  if (customValidation) {
    errors = {
      ...errors,
      ...customValidation(checkedValues),
    };
  }

  validationHandler(errors, onSuccess, component);
};

export default validationExportReport;
