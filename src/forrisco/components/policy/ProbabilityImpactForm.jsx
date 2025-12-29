import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import MultiFields from 'forpdi/src/components/MultiFields';

import riskLevelColors from 'forpdi/src/forrisco/enums/riskLevelColors';
import Messages from 'forpdi/src/Messages';

const probabilityImpactMaxRows = 6;
const probabilityImpactMinRows = 2;
const riskLevelsMaxRows = riskLevelColors.list.length;
const riskLevelsMinRows = 1;
const inputContainerStyle = { margin: 0 };

const ProbImpactForm = ({
  policy,
  onChange,
  errors,
}) => {
  function onChangeProbability(event, idx) {
    const { name, value } = event.target;
    const { probabilities } = policy;
    probabilities[idx] = { ...probabilities[idx], [name]: value };

    onChangeHandler({ probabilities });
  }

  function onChangeImpact(event, idx) {
    const { name, value } = event.target;
    const { impacts } = policy;
    impacts[idx] = { ...impacts[idx], [name]: value };

    onChangeHandler({ impacts });
  }

  function onChangeRiskLevel(event, idx) {
    const { name, value } = event.target;
    const { riskLevels } = policy;

    const parsedValue = name === 'colorId' ? parseColorValue(value) : value;

    riskLevels[idx] = { ...riskLevels[idx], [name]: parsedValue };

    onChangeHandler({ riskLevels });
  }

  function parseColorValue(value) {
    return value !== ''
      ? parseInt(value, 10)
      : undefined;
  }

  function onChangeHandler(fieldChanged) {
    onChange({
      ...policy,
      ...fieldChanged,
      matrix: null,
    });
  }

  function renderRiskLevel() {
    const { riskLevels } = policy;

    const componentRenderers = [
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="name"
          onChange={e => onChangeRiskLevel(e, idx)}
          value={value.name}
          errorMsg={errors[`riskLevelName${idx}`]}
          placeholder={Messages.get('label.riskLevelPlaceholder')}
          maxLength={30}
        />
      ),
      (value, idx) => (
        <SelectBox
          containerStyle={{ marginTop: 0 }}
          options={riskLevelColors.list}
          value={value.colorId}
          errorMsg={errors[`riskLevelColorId${idx}`]}
          name="colorId"
          onChange={e => onChangeRiskLevel(e, idx)}
          showChooseOption
          optionLabelName="label"
        />
      ),
    ];

    return (
      <MultiFields
        componentRenderers={componentRenderers}
        data={riskLevels}
        maxRows={riskLevelsMaxRows}
        minRows={riskLevelsMinRows}
        onNew={data => onChangeHandler({ ...policy, riskLevels: data })}
        onDelete={data => onChangeHandler({ ...policy, riskLevels: data })}
        label={Messages.get('label.policyLevel')}
        required
      />
    );
  }

  function renderProbability() {
    const { probabilities } = policy;

    const componentRenderers = [
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="name"
          onChange={e => onChangeProbability(e, idx)}
          value={value.name}
          errorMsg={errors[`probabilityName${idx}`]}
          placeholder={Messages.get('label.probabilityPlaceholder')}
          maxLength={30}
        />
      ),
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="description"
          onChange={e => onChangeProbability(e, idx)}
          value={value.description}
          errorMsg={errors[`probabilityDescription${idx}`]}
          placeholder={Messages.get('label.probabilityDescriptionPlaceholder')}
          maxLength={400}
        />
      ),
    ];

    return (
      <MultiFields
        componentRenderers={componentRenderers}
        data={probabilities}
        maxRows={probabilityImpactMaxRows}
        minRows={probabilityImpactMinRows}
        onNew={data => onChangeHandler({ probabilities: data })}
        onDelete={data => onChangeHandler({ ...policy, probabilities: data })}
        label={Messages.get('label.policyProbabilityLines')}
        required
      />
    );
  }

  function renderImpact() {
    const { impacts } = policy;

    const componentRenderers = [
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="name"
          onChange={e => onChangeImpact(e, idx)}
          value={value.name}
          errorMsg={errors[`impactName${idx}`]}
          placeholder={Messages.get('label.impactPlaceholder')}
          maxLength={30}
        />
      ),
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="description"
          onChange={e => onChangeImpact(e, idx)}
          value={value.description}
          errorMsg={errors[`impactDescription${idx}`]}
          placeholder={Messages.get('label.impactDescriptionPlaceholder')}
          maxLength={400}
        />
      ),
    ];

    return (
      <MultiFields
        componentRenderers={componentRenderers}
        data={impacts}
        maxRows={probabilityImpactMaxRows}
        minRows={probabilityImpactMinRows}
        onNew={data => onChangeHandler({ ...policy, impacts: data })}
        onDelete={data => onChangeHandler({ ...policy, impacts: data })}
        label={Messages.get('label.policyImpactColumns')}
        required
      />
    );
  }

  return (
    <div>
      {renderRiskLevel()}
      {renderProbability()}
      {renderImpact()}
    </div>
  );
};

ProbImpactForm.propTypes = {
  policy: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

ProbImpactForm.defaultProps = {
  policy: {},
  errors: {},
};

export default ProbImpactForm;
