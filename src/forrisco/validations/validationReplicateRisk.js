import Messages from 'forpdi/src/Messages';

import { getErrors } from 'forpdi/src/forrisco/validations/validationRisk';
import validationHandler from 'forpdi/src/validations/validationHandler';

const validationReplicateRisk = (data, onSuccess, component) => {
  const { risk, selectedPlanRisk, selectedUnits } = data;
  const errors = getErrors(risk);

  if (!selectedPlanRisk) {
    errors.selectedPlanRisk = Messages.get('label.alert.fieldEmpty');
  }
  if (!selectedUnits || selectedUnits.length === 0) {
    errors.selectedUnits = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationReplicateRisk;
