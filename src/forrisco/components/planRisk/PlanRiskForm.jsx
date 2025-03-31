import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';

import Messages from 'forpdi/src/Messages';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';

class PlanRiskForm extends React.Component {
  constructor(props) {
    super(props);

    this.onValidityChange = this.onValidityChange.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);

    this.state = {
      policies: [],
    };
  }

  componentDidMount() {
    PolicyStore.on(
      'list-to-select',
      ({ data }) => {
        this.setState({ policies: data.list });
      },
      this,
    );

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_LIST_TO_SELECT,
    });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  onChangeHandler(e) {
    const { onChange, planRisk } = this.props;
    const { name, value } = e.target;

    onChange({
      ...planRisk,
      [name]: value,
    });
  }

  onValidityChange(validityBegin, validityEnd) {
    const { onChange, planRisk } = this.props;

    onChange({
      ...planRisk,
      validityBegin,
      validityEnd,
    });
  }

  render() {
    const { policies } = this.state;
    const { planRisk, editMode, errors } = this.props;
    const {
      name, validityBegin, validityEnd, policyId, policy, description,
    } = planRisk;

    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={Messages.get('label.planRiskName')}
          onChange={this.onChangeHandler}
          value={name}
          errorMsg={errors.name}
          maxLength={400}
          required
        />
        <DatePickerRange
          beginValue={validityBegin}
          endValue={validityEnd}
          id="validity"
          label={Messages.get('label.planRiskValidity')}
          onChange={this.onValidityChange}
          beginErrorMsg={errors.validityBegin}
          endErrorMsg={errors.validityEnd}
          required
        />
        {editMode ? (
          <InfoDisplay label={Messages.get('label.linkedPolicy')} info={policy.name} />
        ) : (
          <SelectBox
            options={policies}
            label={Messages.get('label.linkedPolicy')}
            value={policyId}
            name="policyId"
            id="policyId"
            onChange={this.onChangeHandler}
            showChooseOption
            errorMsg={errors.policyId}
            required
          />
        )}
        <RichTextArea
          id="description"
          name="description"
          label={Messages.get('label.description')}
          onChange={this.onChangeHandler}
          value={description}
          maxLength={9900}
        />
      </div>
    );
  }
}

PlanRiskForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  planRisk: PropTypes.shape({}),
  editMode: PropTypes.bool,
  errors: PropTypes.shape({}),
};

PlanRiskForm.defaultProps = {
  planRisk: {},
  editMode: false,
  errors: {},
};

export default PlanRiskForm;
