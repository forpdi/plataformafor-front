import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PreventiveActionForm from 'forpdi/src/forrisco/components/risk/preventiveAction/PreventiveActionForm';

import validationPreventiveAction from 'forpdi/src/forrisco/validations/validationPreventiveAction';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class NewPreventiveAction extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    const { risk } = this.props;
    const { user, manager } = risk;
    this.state = {
      preventiveAction: {
        action: '',
        validityBegin: '',
        validityEnd: '',
        userId: user.id,
        managerId: manager.id,
        accomplished: '',
        fileLink: '',
        file: null,
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { risk } = this.props;


    RiskStore.on(
      'preventiveActionCreated', () => {
        toastr.addAlertSuccess(Messages.get('notification.preventiveAction.created'));
        router.push(`/forrisco/risk/${risk.id}/details/preventiveActions`);
      },
    );

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }));
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChangeHandler(preventiveAction) {
    this.setState({
      preventiveAction,
    });
  }

  onSubmit() {
    const { preventiveAction } = this.state;
    const { risk } = this.props;
    const {
      userId,
      action,
      validityBegin,
      validityEnd,
      accomplished,
      managerId,
      fileLink,
      file,
    } = preventiveAction;

    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_NEW_PREVENTIVE_ACTION,
        data: {
          action: {
            action,
            accomplished,
            validityBegin,
            validityEnd,
            risk: { id: risk.id },
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
        label={Messages.get('label.preventiveActionRegister')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }


  renderMainContent() {
    const { errors } = this.state;
    const { preventiveAction } = this.state;

    const { risk } = this.props;
    const { unit } = risk;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{
            title: Messages.get('label.preventiveActionRegister'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            <PreventiveActionForm
              errors={errors}
              preventiveAction={preventiveAction}
              risk={risk}
              onChange={this.onChangeHandler}
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

NewPreventiveAction.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewPreventiveAction.propTypes = {
  risk: PropTypes.shape({}),
};

NewPreventiveAction.defaultProps = {
  risk: {},
};

export default NewPreventiveAction;
