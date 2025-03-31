import React from 'react';
import PropTypes from 'prop-types';

import TextArea from 'forpdi/src/components/inputs/TextArea';

import Messages from 'forpdi/src/Messages';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import ResponsibleSelectors from 'forpdi/src/forrisco/components/risk/ResponsibleSelectors';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const ContingencyForm = ({
  onChange, contingency, risk, errors,
}, { hasForriscoManageRiskPermission }) => {
  const { action, userId, managerId } = contingency;

  function onChangeHandler(event) {
    const { name, value } = event.target;
    onChange({ ...contingency, [name]: value });
  }

  function onValidityChange(validityBegin, validityEnd) {
    onChange({
      ...contingency,
      validityBegin,
      validityEnd,
    });
  }

  function renderForm() {
    const {
      validityBegin,
      validityEnd,
    } = contingency;

    return (
      <div>
        <TextArea
          id="action"
          name="action"
          label={Messages.get('label.action')}
          onChange={onChangeHandler}
          value={action}
          errorMsg={errors.action}
          maxLength={4000}
          required
        />
        <DatePickerRange
          beginValue={validityBegin}
          endValue={validityEnd}
          id="validity"
          label={Messages.get('label.planRiskValidity')}
          onChange={onValidityChange}
          beginErrorMsg={errors.validityBegin}
          endErrorMsg={errors.validityEnd}
        />
        <ResponsibleSelectors
          onChange={onChangeHandler}
          defaultUser={contingency.user}
          defaultManager={contingency.manager}
          selectedUserId={userId}
          selectedManagerId={managerId}
          errors={errors}
          hasPermission={isResponsibleOrHasPermission(risk, hasForriscoManageRiskPermission)}
        />
      </div>
    );
  }

  return renderForm();
};

ContingencyForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  contingency: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
};

ContingencyForm.defaultProps = {
  errors: {},
};

export default ContingencyForm;
