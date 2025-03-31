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
import { riskToData } from 'forpdi/src/forrisco/helpers/riskHelper';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class NewRisk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      risk: {
        name: '',
        code: '',
        userId: undefined,
        managerId: undefined,
        reason: '',
        result: '',
        probability: '',
        impact: '',
        periodicity: '',
        type: '',
        checkedTypologies: [],
        checkedStrategies: [],
        checkedObjectives: [],
        checkedAxes: [],
        checkedIndicators: [],
        checkedGoals: [],
        otherTypologies: '',
        activities: [],
        response: undefined,
        level: undefined,
        sharedUnits: [],
        archived: false,
      },
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { router, toastr } = this.context;
    const { unitId } = params;

    UnitStore.on('unitRetrieved', ({ data }) => {
      this.setState({ unit: data });
    }, this);

    RiskStore.on('riskcreated', () => {
      const { unit } = this.state;
      const { parent } = unit;
      toastr.addAlertSuccess(Messages.get('notification.risk.create'));
      if (parent) {
        router.push(`/forrisco/subunit/${unitId}/risks`);
      } else {
        router.push(`/forrisco/unit/${unitId}/risks`);
      }
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    UnitStore.dispatch({
      action: UnitStore.ACTION_RETRIEVE_UNIT,
      data: unitId,
    });
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
        action: RiskStore.ACTION_NEWRISK,
        data: riskToData(risk, unit),
      })
    );

    validationRisk(risk, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newRisk')}
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
            tag: getUnitTagLabel(unit),
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
      unit,
    } = this.state;

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

NewRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewRisk.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }),
  location: PropTypes.shape({}).isRequired,
};

NewRisk.defaultProps = {
  params: {},
};

export default NewRisk;
