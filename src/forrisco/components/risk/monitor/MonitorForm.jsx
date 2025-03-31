import React from 'react';
import PropTypes from 'prop-types';

import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import DateTimePicker from 'forpdi/src/components/inputs/DateTimePicker';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ResponsibleSelectors from 'forpdi/src/forrisco/components/risk/ResponsibleSelectors';

import { probabilityImpactToOptions } from 'forpdi/src/forrisco/helpers/riskHelper';
import Messages from 'forpdi/src/Messages';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const MonitorForm = ({
  onChange, monitor, risk, policy, errors,
}, { hasForriscoManageRiskPermission }) => {
  function onChangeHandler(event) {
    const { name, value } = event.target;
    onChange({ ...monitor, [name]: value });
  }

  function onDateTimeChange(beginDate, beginTime) {
    onChange({
      ...monitor,
      beginDate,
      beginTime,
    });
  }

  function renderImpactAndProbability() {
    const { impact, probability } = policy;
    const { impact: impactValue, probability: probabilityValue } = monitor;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={probabilityImpactToOptions(probability)}
            label={Messages.get('label.probability')}
            value={probabilityValue}
            errorMsg={errors.probability}
            name="probability"
            id="probability"
            onChange={onChangeHandler}
            showChooseOption
            required
          />
        </div>
        <div className="col col-sm-6">
          <SelectBox
            options={probabilityImpactToOptions(impact)}
            label={Messages.get('label.impact')}
            value={impactValue}
            errorMsg={errors.impact}
            name="impact"
            id="impact"
            onChange={onChangeHandler}
            showChooseOption
            required
          />
        </div>
      </InputContainer>
    );
  }

  function renderReport() {
    const {
      report,
    } = monitor;
    return (
      <RichTextArea
        id="report"
        name="report"
        label={Messages.get('label.report')}
        onChange={onChangeHandler}
        value={report}
        errorMsg={errors.report}
        maxLength={4000}
        required
      />
    );
  }

  function renderResponsableAndDateTime() {
    const {
      userId,
      managerId,
      user,
      manager,
    } = monitor;

    return (
      <ResponsibleSelectors
        onChange={onChangeHandler}
        defaultUser={user}
        defaultManager={manager}
        selectedUserId={userId}
        selectedManagerId={managerId}
        errors={errors}
        hasPermission={isResponsibleOrHasPermission(risk, hasForriscoManageRiskPermission)}
      />
    );
  }

  function renderDateTime() {
    const { beginDate, beginTime } = monitor;

    return (
      <DateTimePicker
        label={Messages.get('label.dateTime')}
        name="begin"
        id="begin"
        date={beginDate}
        time={beginTime}
        onChange={onDateTimeChange}
        dateErrorMsg={errors.beginDate}
        timeErrorMsg={errors.beginTime}
        required
      />
    );
  }

  return (
    <div>
      {renderReport()}
      {renderImpactAndProbability()}
      {renderResponsableAndDateTime()}
      {renderDateTime()}
    </div>
  );
};

MonitorForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  monitor: PropTypes.shape({}).isRequired,
  risk: PropTypes.shape({}).isRequired,
  policy: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}),
};

MonitorForm.defaultProps = {
  errors: {},
};

export default MonitorForm;
