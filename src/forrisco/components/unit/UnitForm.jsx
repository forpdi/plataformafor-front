import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';

import Messages from 'forpdi/src/Messages';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UserStore from 'forpdi/src/forpdi/core/store/User';

class UnitForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plans: [],
      users: [],
    };
  }

  componentDidMount() {
    const { unit, isSubunitForm } = this.props;
    const { user } = unit;
    const { policyId } = unit;
    const { hasForriscoEditUnitPermission } = this.context;

    PlanRiskStore.on('list-to-select', ({ data }) => {
      this.setState({ plans: data.list });
    }, this);

    UserStore.on('retrieve-to-select-user', ({ data }) => {
      this.setState({ users: data.list });
    }, this);

    hasForriscoEditUnitPermission
      ? UserStore.dispatch({
        action: UserStore.ACTION_RETRIEVE_TO_SELECT_USER,
      })
      : this.setState({ users: [user] });

    if (!isSubunitForm) {
      PlanRiskStore.dispatch({
        action: PlanRiskStore.ACTION_LIST_TO_SELECT,
        data: { policyId },
      });
    }
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
    UserStore.off(null, null, this);
  }

  onChangeHandler = (e) => {
    const { onChange, unit } = this.props;
    const { name, value } = e.target;

    onChange({
      ...unit,
      [name]: value,
    });
  }

  render() {
    const { plans, users } = this.state;
    const {
      unit,
      errors,
      isSubunitForm,
      isLockedPlanRisk,
    } = this.props;
    const {
      abbreviation,
      description,
      name,
      planRiskId,
      userId,
    } = unit;
    const { hasForriscoEditUnitPermission } = this.context;

    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={isSubunitForm ? Messages.get('label.subunitName') : Messages.get('label.unityName')}
          onChange={this.onChangeHandler}
          value={name}
          errorMsg={errors.name}
          maxLength={255}
          required
        />
        <TextField
          id="abbreviation"
          name="abbreviation"
          label={Messages.get('label.abbreviation')}
          onChange={this.onChangeHandler}
          value={abbreviation}
          errorMsg={errors.abbreviation}
          maxLength={255}
          required
        />
        <SelectBox
          options={users}
          label={Messages.get('label.responsible')}
          value={userId}
          name="userId"
          id="userId"
          onChange={this.onChangeHandler}
          showChooseOption
          errorMsg={errors.userId}
          required
          disabled={!hasForriscoEditUnitPermission}
        />
        {!isSubunitForm && !isLockedPlanRisk && (
          <SelectBox
            options={plans}
            label={Messages.get('label.linkedPlanRisk')}
            name="planRiskId"
            id="planRiskId"
            onChange={this.onChangeHandler}
            showChooseOption
            errorMsg={errors.planRiskId}
            value={planRiskId}
            required
          />
        )}
        <RichTextArea
          id="description"
          name="description"
          label={Messages.get('label.description')}
          onChange={this.onChangeHandler}
          value={description}
          maxLength={4000}
        />
      </div>
    );
  }
}

UnitForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  planRisk: PropTypes.shape({}),
  errors: PropTypes.shape({}),
  unit: PropTypes.shape({}),
  isSubunitForm: PropTypes.bool,
  isLockedPlanRisk: PropTypes.bool,
};

UnitForm.defaultProps = {
  planRisk: {},
  errors: {},
  unit: [],
  isSubunitForm: false,
  isLockedPlanRisk: false,
};

UnitForm.contextTypes = {
  hasForriscoEditUnitPermission: PropTypes.bool.isRequired,
};

export default UnitForm;
