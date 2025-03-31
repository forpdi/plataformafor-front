import Messages from 'forpdi/src/Messages';

import validationHandler from 'forpdi/src/validations/validationHandler';

const validationClonePlanRisk = (data, items, units, onSuccess, component) => {
  const { name, keepItemsIsChecked, keepUnitsIsChecked } = data;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = Messages.get('label.alert.fieldEmpty');
  }

  if (keepItemsIsChecked === null) {
    errors.keepItemsIsChecked = Messages.get('label.alert.fieldEmpty');
  }

  if (keepUnitsIsChecked === null) {
    errors.keepUnitsIsChecked = Messages.get('label.alert.fieldEmpty');
  }

  if (keepItemsIsChecked && emptySelection(items, data.keepItems)) {
    errors.keepItems = Messages.get('label.alert.fieldEmpty');
  }

  if (keepUnitsIsChecked && emptySelection(units, data.keepUnits)) {
    errors.keepUnits = Messages.get('label.alert.fieldEmpty');
  }

  validationHandler(errors, onSuccess, component);
};

const emptySelection = (elementsToSelect, elementsSelected) => (
  elementsToSelect.length > 0 && elementsSelected.length === 0
);

export default validationClonePlanRisk;
