import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';

import Messages from 'forpdi/src/Messages';

const PolicyForm = ({ policy, onChange, errors }) => {
  const onChangeHandler = (event) => {
    const { name, value } = event.target;

    onChange({
      ...policy,
      [name]: value,
    });
  };

  const onValidityChange = (validityBegin, validityEnd) => {
    onChange({
      ...policy,
      validityBegin,
      validityEnd,
    });
  };

  const render = () => {
    const {
      name, description, validityBegin, validityEnd,
    } = policy;
    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={Messages.get('label.policyName')}
          onChange={onChangeHandler}
          value={name}
          errorMsg={errors.name}
          maxLength={400}
          required
        />
        <RichTextArea
          id="description"
          name="description"
          label={Messages.get('label.description')}
          onChange={onChangeHandler}
          value={description}
          maxLength={9900}
        />
        <DatePickerRange
          beginValue={validityBegin}
          endValue={validityEnd}
          id="validity"
          label={Messages.get('label.planRiskValidity')}
          onChange={onValidityChange}
          beginErrorMsg={errors.validityBegin}
          endErrorMsg={errors.validityEnd}
          required
        />
      </div>
    );
  };

  return render();
};

PolicyForm.propTypes = {
  policy: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

PolicyForm.defaultProps = {
  policy: {},
  errors: {},
};

export default PolicyForm;
