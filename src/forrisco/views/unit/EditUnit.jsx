import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import UnitForm from 'forpdi/src/forrisco/components/unit/UnitForm';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import validationUnit from 'forpdi/src/forrisco/validations/validationUnit';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditUnit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { unitId } = params;

    UnitStore.on('unitRetrieved', ({ data }) => {
      const { planRisk, user, parent } = data;
      const { id: userId } = user;
      const { id: planRiskId } = planRisk;
      const { policy } = planRisk;

      if (data !== null) {
        this.setState({
          unit: {
            ...data,
            planRiskId,
            userId,
            parentId: (parent && parent.id),
            policyId: policy.id,
          },
        });
      }
    }, this);

    UnitStore.dispatch({
      action: UnitStore.ACTION_RETRIEVE_UNIT,
      data: unitId,
    });

    UnitStore.on('unitUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    UnitStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  onChangeHandler = (unit) => {
    this.setState({ unit });
  }

  onSubmit = () => {
    const { unit } = this.state;

    const onSuccess = () => {
      const { planRiskId, userId, parentId } = unit;

      UnitStore.dispatch({
        action: UnitStore.ACTION_UPDATE_UNIT,
        data: {
          ...this.state,
          unit: {
            ...unit,
            planRisk: { id: planRiskId },
            user: { id: userId },
            parent: { id: parentId },
          },
        },
      });
    };

    validationUnit(unit, onSuccess, this);
  }

  isSubunitForm = () => {
    const { unit } = this.state;

    return unit.parentId !== undefined
      && unit.parentId !== null;
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={this.isSubunitForm() ? Messages.get('label.editSubunit') : Messages.get('label.editUnit')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { unit, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: (this.isSubunitForm() ? Messages.get('label.subunit') : Messages.get('label.unit')) }}
        >
          <TabbedPanel.MainContainer>
            <UnitForm
              errors={errors}
              unit={unit}
              onChange={this.onChangeHandler}
              isSubunitForm={this.isSubunitForm()}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { unit } = this.state;
    if (!unit) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

EditUnit.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditUnit.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default EditUnit;
