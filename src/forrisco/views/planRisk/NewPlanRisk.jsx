import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PlanRiskForm from 'forpdi/src/forrisco/components/planRisk/PlanRiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import FormPageTop from 'forpdi/src/components/FormPageTop';

import Messages from 'forpdi/src/Messages';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import validationPlanRegister from 'forpdi/src/forrisco/validations/validationPlanRisk';

class NewPlanRisk extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      planRisk: {
        name: '',
        validityBegin: '',
        validityEnd: '',
        policyId: undefined,
        description: '',
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    PlanRiskStore.on(
      'plaRiskCreated',
      () => {
        toastr.addAlertSuccess(Messages.get('notification.plan.save'));
        router.push('/forrisco/plan-risk');
      },
    );

    PlanRiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  onChangeHandler(planRisk) {
    this.setState({
      planRisk,
    });
  }

  onSubmit() {
    const { planRisk } = this.state;

    const onSuccess = () => (
      PlanRiskStore.newPlanRisk({
        ...planRisk,
        policy: {
          id: planRisk.policyId,
        },
      })
    );

    validationPlanRegister(planRisk, onSuccess, this);
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newPlanRisco')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { planRisk, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: Messages.get('label.generalInfo') }}
        >
          <TabbedPanel.MainContainer>
            <PlanRiskForm errors={errors} planRisk={planRisk} onChange={this.onChangeHandler} />
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

NewPlanRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewPlanRisk;
