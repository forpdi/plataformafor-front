import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import TextField from 'forpdi/src/components/inputs/TextField';
import TextArea from 'forpdi/src/components/inputs/TextArea';
import RadioButtonGroup from 'forpdi/src/components/inputs/RadioButtonGroup';
import CheckBoxGroup from 'forpdi/src/components/inputs/CheckBoxGroup';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';

import Messages from 'forpdi/src/Messages';
import radioButtonOptions from 'forpdi/src/enums/yesNoOptions';

const toCheckBoxOptions = data => (
  _.map(data, element => (
    { label: element.name, value: element.id }
  ))
);

const ClonePlanRiskForm = ({
  errors,
  planRisk,
  newPlanRisk,
  units,
  items,
  onChange,
}) => {
  function onChangeHandler(event) {
    const { name, value } = event.target;
    onChange({ ...newPlanRisk, [name]: value });
  }

  function onChangeRadioButton(value, name) {
    onChange({ ...newPlanRisk, [name]: value });
  }

  function onChangeCheckBoxHandler(values, name) {
    onChange({ ...newPlanRisk, [name]: values });
  }

  function renderKeepItens() {
    const { keepItemsIsChecked, keepItems } = newPlanRisk;
    return (
      <div style={{ minWidth: '50%', maxWidth: '50%' }}>
        <RadioButtonGroup
          groupName="keepItemsIsChecked"
          label={Messages.get('label.keepPlanItems')}
          onChange={onChangeRadioButton}
          checkedValue={keepItemsIsChecked}
          errorMsg={errors.keepItemsIsChecked}
          className="horizontal-radio-group"
          options={radioButtonOptions.list}
          required
        />

        {keepItemsIsChecked && (
          <CheckBoxGroup
            groupName="keepItems"
            label={Messages.get('label.checkItems')}
            onChange={onChangeCheckBoxHandler}
            errorMsg={errors.keepItems}
            className="check-group-border"
            style={{ width: '80%' }}
            options={toCheckBoxOptions(items)}
            checkedValues={keepItems}
          />
        )}
      </div>
    );
  }

  function renderKeepUnits() {
    const { keepUnitsIsChecked, keepUnits } = newPlanRisk;

    return (
      <div style={{ minWidth: '50%', maxWidth: '50%' }}>
        <RadioButtonGroup
          groupName="keepUnitsIsChecked"
          label={Messages.get('label.keepUnits')}
          onChange={onChangeRadioButton}
          checkedValue={keepUnitsIsChecked}
          errorMsg={errors.keepUnitsIsChecked}
          className="horizontal-radio-group"
          options={radioButtonOptions.list}
          required
        />

        {keepUnitsIsChecked && (
          <CheckBoxGroup
            groupName="keepUnits"
            label={Messages.get('label.checkOptions')}
            onChange={onChangeCheckBoxHandler}
            errorMsg={errors.keepUnits}
            className="check-group-border"
            style={{ width: '80%' }}
            options={toCheckBoxOptions(units)}
            checkedValues={keepUnits}
          />
        )}
      </div>
    );
  }

  const { name, policy } = planRisk;

  const { name: newName, description } = newPlanRisk;

  return (
    <div>
      <InfoDisplay label={Messages.get('label.clonePlanRiskName')} info={name} />
      <InfoDisplay label={Messages.get('label.cloneLinkedPolicy')} info={policy.name} />

      <div style={{ display: 'flex', flexWrap: 'wrap', minWidth: '100%' }}>
        {renderKeepItens()}
        {renderKeepUnits()}
      </div>

      <TextField
        id="name"
        name="name"
        maxLength={400}
        label={Messages.get('label.newClonePlanRiskName')}
        onChange={onChangeHandler}
        value={newName}
        errorMsg={errors.name}
        required
      />
      <TextArea
        id="description"
        name="description"
        label={Messages.get('label.newDescription')}
        onChange={onChangeHandler}
        value={description}
      />
    </div>
  );
};

ClonePlanRiskForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  planRisk: PropTypes.shape({}),
  newPlanRisk: PropTypes.shape({}),
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  errors: PropTypes.shape({}),
};

ClonePlanRiskForm.defaultProps = {
  planRisk: {},
  errors: {},
  newPlanRisk: {},
};

export default ClonePlanRiskForm;
