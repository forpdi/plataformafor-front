import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import FormPageTop from 'forpdi/src/components/FormPageTop';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import ContingencyForm from 'forpdi/src/forrisco/components/risk/contingency/ContingencyForm';

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import validationContingency from 'forpdi/src/forrisco/validations/validationContingency';

class EditContingency extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      contingency: null,
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { contingencyId } = params;

    RiskStore.on('findContingency', ({ data }) => {
      const {
        action,
        user,
        validityBegin,
        validityEnd,
        risk,
        manager,
      } = data;
      const { unit } = risk;

      this.setState({
        contingency: {
          contingencyId,
          action,
          validityBegin: validityBegin || '',
          validityEnd: validityEnd || '',
          user,
          manager,
          managerId: manager && manager.id,
          userId: user.id,
          riskId: risk.id,
        },
        unit,
      });
    }, this);

    RiskStore.on('contingencyUpdated', ({ data }) => {
      const { risk } = data;
      router.push(`/forrisco/risk/${risk.id}/details/contingency`);
      toastr.addAlertSuccess(Messages.get('notification.contingency.updated'));
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }));

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_CONTINGENCY,
      data: contingencyId,
    });
  }

  onSubmit() {
    const { contingency } = this.state;
    const {
      riskId,
      userId,
      validityBegin,
      validityEnd,
      contingencyId,
      action,
      managerId,
    } = contingency;
    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_UPDATE_CONTINGENCY,
        data: {
          contingency: {
            id: contingencyId,
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

  renderTopContent() {
    const { waitingSubmit } = this.state;
    return (
      <FormPageTop
        label={Messages.get('label.editContingency')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { contingency, errors, unit } = this.state;
    const { risk } = this.props;

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
            { contingency && unit && risk ? (
              <ContingencyForm
                contingency={contingency}
                risk={risk}
                errors={errors}
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

EditContingency.propTypes = {
  params: PropTypes.shape({
    contingencyId: PropTypes.string.isRequired,
  }).isRequired,
  risk: PropTypes.shape({}),
};

EditContingency.defaultProps = {
  risk: null,
};

EditContingency.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default EditContingency;
