import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import RiskForm from 'forpdi/src/forrisco/components/risk/RiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import validationRisk from 'forpdi/src/forrisco/validations/validationRisk';
import { riskToData, dataToRisk } from 'forpdi/src/forrisco/helpers/riskHelper';


class EditRisk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      risk: null,
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { router, toastr } = this.context;
    const { riskId } = params;

    RiskStore.on('findRisk', (response) => {
      const { data } = response;
      const {
        unit,
      } = data;

      this.setState({
        risk: dataToRisk(data),
        unit,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_RISK,
      data: riskId,
    });

    RiskStore.on('riskUpdated', () => {
      const { unit } = this.state;
      const { id } = unit;

      toastr.addAlertSuccess(Messages.get('notification.risk.update'));
      this.setState({ waitingSubmit: false });
      router.push(`/forrisco/unit/${id}/risks`);
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
  }

  onChangeHandler = (risk) => {
    this.setState({ risk });
  }

  onSubmit = () => {
    const { risk, unit } = this.state;
    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_CUSTOM_UPDATE,
        data: riskToData(risk, unit),
      })
    );

    validationRisk(risk, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editRisk')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const {
      risk,
      errors,
      unit,
    } = this.state;

    const { planRisk } = unit;
    const { policy } = planRisk;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.risk') }]}
          topContainerContent={{
            title: Messages.get('label.risk'),
            tag: `${unit.abbreviation} - ${unit.name}`,
          }}
        >
          <TabbedPanel.MainContainer>
            <RiskForm
              errors={errors}
              risk={risk}
              policy={policy}
              planRisk={planRisk}
              onChange={this.onChangeHandler}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const {
      risk,
    } = this.state;

    if (!risk) {
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

EditRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditRisk.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }),
  location: PropTypes.shape({}).isRequired,
};

EditRisk.defaultProps = {
  params: {},
};

export default EditRisk;
