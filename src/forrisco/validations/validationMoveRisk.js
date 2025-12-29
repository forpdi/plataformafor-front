import Messages from 'forpdi/src/Messages';

import { getErrors } from 'forpdi/src/forrisco/validations/validationRisk';
import validationHandler from 'forpdi/src/validations/validationHandler';

const validationMoveRisk = (data, onSuccess, component) => {
  const { risk, selectedPlanRisk, selectedUnit } = data;
  const errors = getErrors(risk);

  if (!selectedPlanRisk) {
    errors.selectedPlanRisk = Messages.get('label.alert.fieldEmpty');
  }
  if (!selectedUnit) {
    errors.selectedUnit = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

export default validationMoveRisk;
