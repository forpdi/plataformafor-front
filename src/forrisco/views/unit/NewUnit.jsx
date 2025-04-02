import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import UnitForm from 'forpdi/src/forrisco/components/unit/UnitForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import validationUnit from 'forpdi/src/forrisco/validations/validationUnit';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class NewUnit extends React.Component {
  constructor(props) {
    super(props);

    const { params } = props;
    this.isSubunitForm = params.parentId !== undefined
      && params.parentId !== null;

    this.state = {
      unit: {
        abbreviation: '',
        description: '',
        name: '',
        planRiskId: undefined,
        userId: undefined,
        parentId: null,
      },
      parentUnit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { parentId } = params;
    const { planRiskId } = params;

    UnitStore.on(
      'unitcreated',
      () => {
        toastr.addAlertSuccess(Messages.get('notification.unit.save'));
        planRiskId
          ? router.push(`/forrisco/plan-risk/${planRiskId}/units`)
          : router.push('/forrisco/unit');
      }, this,
    );

    UnitStore.on(
      'unitRetrieved',
      response => this.setState({ parentUnit: response.data }),
      this,
    );

    UnitStore.on(
      'subunitCreated',
      () => {
        toastr.addAlertSuccess(Messages.get('notification.subunit.save'));
        router.push(`forrisco/unit/${parentId}/subunits`);
      }, this,
    );

    UnitStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    if (this.isSubunitForm) {
      UnitStore.on('unitRetrieved', (response) => {
        const { data: parentUnit } = response;
        const { planRisk } = parentUnit;
        const { unit } = this.state;
        this.setState({
          parentUnit,
          unit: {
            ...unit,
            planRiskId: planRisk.id,
            parentId: parentUnit.id,
          },
        });
      }, this);

      UnitStore.dispatch({
        action: UnitStore.ACTION_RETRIEVE_UNIT,
        data: parentId,
      });
    }
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  onChangeHandler = (unit) => {
    this.setState({
      unit,
    });
  }

  onSubmit = () => {
    const { unit } = this.state;
    const { params } = this.props;
    const { planRiskId } = params;

    const data = {
      ...unit,
      planRisk: {
        id: planRiskId || unit.planRiskId,
      },
      user: {
        id: unit.userId,
      },
    };

    const onSuccess = () => {
      if (this.isSubunitForm) {
        UnitStore.newSubunit({
          ...data,
          parent: {
            id: unit.parentId,
          },
        });
      } else {
        UnitStore.newUnit(data);
      }
    };

    validationUnit(data, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={this.isSubunitForm ? Messages.get('label.newSubunit') : Messages.get('label.newUnity')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { unit, errors, parentUnit } = this.state;
    const { params } = this.props;
    const { planRiskId } = params;

    if (this.isSubunitForm && !parentUnit) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: this.isSubunitForm ? Messages.get('label.subunit') : Messages.get('label.unit') }]}
          topContainerContent={{
            title: this.isSubunitForm ? Messages.get('label.subunit') : Messages.get('label.unit'),
            tag: this.isSubunitForm ? getUnitTagLabel(parentUnit) : null,
          }}
        >
          <TabbedPanel.MainContainer>
            <UnitForm
              errors={errors}
              unit={unit}
              onChange={this.onChangeHandler}
              isSubunitForm={this.isSubunitForm}
              isLockedPlanRisk={!!planRiskId}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewUnit.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewUnit.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }),
  location: PropTypes.shape({}).isRequired,
};

NewUnit.defaultProps = {
  params: {},
};

export default NewUnit;
