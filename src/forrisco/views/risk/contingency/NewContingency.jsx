import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import FormPageTop from 'forpdi/src/components/FormPageTop';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import ContingencyForm from 'forpdi/src/forrisco/components/risk/contingency/ContingencyForm';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import validationContingency from 'forpdi/src/forrisco/validations/validationContingency';

class NewContingency extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    const { risk } = this.props;
    const { user, manager } = risk;
    this.state = {
      contingency: {
        action: '',
        validityBegin: '',
        validityEnd: '',
        userId: user.id,
        managerId: manager.id,
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { risk } = this.props;
    const { id: riskId } = risk;

    RiskStore.on(
      'contingencyCreated', () => {
        toastr.addAlertSuccess(Messages.get('notification.contingency.created'));
        router.push(`/forrisco/risk/${riskId}/details/contingency`);
      },
    );

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }));
  }

  onSubmit() {
    const { contingency } = this.state;
    const { risk } = this.props;
    const { id: riskId } = risk;
    const {
      action,
      userId,
      managerId,
      validityBegin,
      validityEnd,
    } = contingency;

    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_NEW_CONTINGENCY,
        data: {
          contingency: {
            action,
            validityBegin,
            validityEnd,
            risk: { id: riskId },
            user: { id: userId },
            manager: { id: managerId },
          },
        },
      })
    );

    validationContingency(contingency, onSuccess, this);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChangeHandler = (contingency) => {
    this.setState({ contingency });
  }

  renderTopContent = () => {
    const { waitingSubmit } = this.state;
    return (
      <FormPageTop
        label={Messages.get('label.contingencyRegister')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent = () => {
    const { contingency, errors } = this.state;

    const { risk } = this.props;
    const { unit } = risk;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.contingency') }]}
          topContainerContent={{
            title: Messages.get('label.contingencyActions'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            <ContingencyForm
              contingency={contingency}
              risk={risk}
              errors={errors}
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

NewContingency.propTypes = {
  risk: PropTypes.shape({}),
};

NewContingency.defaultProps = {
  risk: {},
};

NewContingency.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewContingency;
