import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PlanRiskForm from 'forpdi/src/forrisco/components/planRisk/PlanRiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import validationPlanRegister from 'forpdi/src/forrisco/validations/validationPlanRisk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditPlanRisk extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      planRisk: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router } = this.context;
    const { toastr } = this.context;

    const { params } = this.props;
    const { planRiskId } = params;

    PlanRiskStore.on('retrivedplanrisk', ({ data }) => {
      const { policy } = data;
      const { id } = policy;
      if (data !== null) {
        this.setState({
          planRisk:
          {
            ...data,
            policyId: id,
          },
        });
      }
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_RETRIEVE_PLANRISK,
      data: planRiskId,
    });

    PlanRiskStore.on('editPlanRisk', ({ data }) => {
      router.push(`/forrisco/plan-risk/${data.id}/info`);
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    PlanRiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
  }

  onChangeHandler(planRisk) {
    this.setState({
      planRisk,
    });
  }

  onSubmit() {
    const { planRisk } = this.state;
    const onSuccess = () => (
      PlanRiskStore.dispatch({
        action: PlanRiskStore.ACTION_EDIT_PLANRISK,
        data: {
          ...planRisk,
          policy: {
            id: planRisk.policyId,
          },
        },
      })
    );

    validationPlanRegister(planRisk, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.title.editPlanRisk')}
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
            {
              planRisk ? (
                <PlanRiskForm
                  errors={errors}
                  planRisk={planRisk}
                  editMode
                  onChange={this.onChangeHandler}
                />
              ) : (
                <LoadingGauge />
              )
            }
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

EditPlanRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPlanRisk.propTypes = {
  params: PropTypes.shape({
    planRiskId: PropTypes.string.isRequired,
  }).isRequired,
};

export default EditPlanRisk;
