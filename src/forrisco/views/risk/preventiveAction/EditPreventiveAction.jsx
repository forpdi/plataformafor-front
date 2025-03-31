import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PreventiveActionForm from 'forpdi/src/forrisco/components/risk/preventiveAction/PreventiveActionForm';

import validationPreventiveAction from 'forpdi/src/forrisco/validations/validationPreventiveAction';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class EditPreventiveAction extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      preventiveAction: null,
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { actionId } = params;

    RiskStore.on('preventiveActionUpdated', ({ data }) => {
      const { risk } = data;
      router.push(`/forrisco/risk/${risk.id}/details/preventiveActions`);
      toastr.addAlertSuccess(Messages.get('notification.preventiveAction.updated'));
    }, this);

    RiskStore.on('findPreventiveAction', ({ data }) => {
      const {
        action,
        accomplished,
        validityBegin,
        validityEnd,
        user,
        risk,
        manager,
        fileLink,
        file,
      } = data;

      const { unit } = risk;

      this.setState({
        preventiveAction: {
          actionId,
          action,
          accomplished,
          validityBegin: validityBegin || '',
          validityEnd: validityEnd || '',
          user,
          manager,
          userId: user.id,
          riskId: risk.id,
          managerId: manager && manager.id,
          fileLink: fileLink || '',
          file: file || null,
        },
        unit,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_PREVENTIVE_ACTION,
      data: actionId,
    });

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    RiskStore.off('findPreventiveAction', null, this);
  }

  onChangeHandler(preventiveAction) {
    this.setState({
      preventiveAction,
    });
  }


  onSubmit() {
    const { preventiveAction } = this.state;
    const {
      riskId,
      userId,
      actionId,
      action,
      accomplished,
      validityBegin,
      validityEnd,
      managerId,
      fileLink,
      file,
    } = preventiveAction;

    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_UPDATE_PREVENTIVE_ACTION,
        data: {
          action: {
            id: actionId,
            action,
            accomplished,
            validityBegin,
            validityEnd,
            risk: { id: riskId },
            user: { id: userId },
            manager: { id: managerId },
            fileLink,
            file,
          },
        },
      })
    );

    validationPreventiveAction(preventiveAction, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.preventiveActionEdit')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }


  renderMainContent() {
    const { preventiveAction, unit, errors } = this.state;
    const { risk } = this.props;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{
            title: Messages.get('label.preventiveActionEdit'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            {preventiveAction && unit && risk ? (
              <PreventiveActionForm
                errors={errors}
                preventiveAction={preventiveAction}
                risk={risk}
                onChange={this.onChangeHandler}
              />
            ) : <LoadingGauge />}
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

EditPreventiveAction.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPreventiveAction.propTypes = {
  params: PropTypes.shape({
    actionId: PropTypes.string.isRequired,
  }).isRequired,
  risk: PropTypes.shape({}),
};

EditPreventiveAction.defaultProps = {
  risk: null,
};

export default EditPreventiveAction;
