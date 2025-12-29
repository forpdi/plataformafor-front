import React from 'react';
import PropTypes from 'prop-types';

import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import TextArea from 'forpdi/src/components/inputs/TextArea';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import DateTimePicker from 'forpdi/src/components/inputs/DateTimePicker';
import ResponsibleSelectors from 'forpdi/src/forrisco/components/risk/ResponsibleSelectors';

import riskType from 'forpdi/src/forrisco/enums/riskType';
import Messages from 'forpdi/src/Messages';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const IncidentForm = ({
  onChange, incident, risk, errors,
}, { hasForriscoManageRiskPermission }) => {
  function onChangeHandler(e) {
    const { name, value } = e.target;

    onChange({
      ...incident,
      [name]: value,
    });
  }

  function onChooseDate(date, time) {
    onChange({
      ...incident,
      date,
      time,
    });
  }

  function renderForm() {
    const {
      date,
      time,
      type,
      description,
      correctionalActions,
      userId,
      managerId,
    } = incident;

    return (
      <div>
        <RichTextArea
          id="description"
          name="description"
          label={Messages.get('label.description')}
          onChange={onChangeHandler}
          value={description}
          errorMsg={errors.description}
          maxLength={4000}
        />
        <TextArea
          id="correctionalActions"
          name="correctionalActions"
          label={Messages.get('label.correctionalActions')}
          onChange={onChangeHandler}
          value={correctionalActions}
          errorMsg={errors.correctionalActions}
          maxLength={4000}
          required
        />
        <ResponsibleSelectors
          onChange={onChangeHandler}
          defaultUser={incident.user}
          defaultManager={incident.manager}
          selectedUserId={userId}
          selectedManagerId={managerId}
          errors={errors}
          hasPermission={isResponsibleOrHasPermission(risk, hasForriscoManageRiskPermission)}
        />
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={riskType.list}
              label={Messages.get('label.type')}
              value={type}
              name="type"
              id="type"
              onChange={onChangeHandler}
              showChooseOption
              errorMsg={errors.type}
              required
            />
          </div>
          <div className="col col-sm-6">
            <DateTimePicker
              date={date}
              time={time}
              name="begin"
              id="begin"
              label={Messages.get('label.dateTime')}
              onChange={onChooseDate}
              dateErrorMsg={errors.date}
              timeErrorMsg={errors.time}
              required
            />
          </div>
        </InputContainer>
      </div>
    );
  }

  return renderForm();
};


IncidentForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
  incident: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
};

IncidentForm.defaultProps = {
  errors: {},
  incident: {},
};

export default IncidentForm;
