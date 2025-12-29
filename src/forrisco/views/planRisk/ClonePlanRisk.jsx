import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ClonePlanRiskForm from 'forpdi/src/forrisco/components/planRisk/ClonePlanRiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import validationClonePlanRisk from 'forpdi/src/forrisco/validations/validationClonePlanRisk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';

class ClonePlanRisk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planRisk: null,
      units: null,
      items: null,
      newPlanRisk: {
        name: '',
        description: '',
        keepItems: [],
        keepUnits: [],
        keepItemsIsChecked: null,
        keepUnitsIsChecked: null,
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router } = this.context;
    const { toastr } = this.context;

    const { params } = this.props;
    const { planRiskId } = params;

    PlanRiskStore.on('retrivedplanrisk', (response) => {
      this.setState({ planRisk: response.data });
    }, this);

    UnitStore.on('unitbyplan', (response) => {
      this.setState({
        units: response.data,
      });
    }, this);

    PlanRiskItemStore.on('allItems', (response) => {
      this.setState({
        items: response.data,
      });
    }, this);

    PlanRiskStore.on('plaRiskCreated', (response) => {
      const { newPlanRisk, items, units } = this.state;
      const {
        keepItems, keepUnits, keepItemsIsChecked, keepUnitsIsChecked,
      } = newPlanRisk;

      if (keepItems.length > 0 && keepItemsIsChecked) {
        const checkedItemsList = items.filter(item => keepItems.includes(item.id));

        PlanRiskItemStore.dispatch({
          action: PlanRiskItemStore.ACTION_ITENS_DUPLICATE,
          data: {
            itens: checkedItemsList,
            planRisk: response.data,
          },
        });
      }

      if (keepUnits.length > 0 && keepUnitsIsChecked) {
        const checkedUnitsList = units.filter(unit => keepUnits.includes(unit.id));
        UnitStore.dispatch({
          action: UnitStore.ACTION_DUPLICATE,
          data: {
            units: checkedUnitsList,
            planRisk: { id: response.data.id },
          },
        });
      }

      router.push('/forrisco/plan-risk/');
      toastr.addAlertSuccess(Messages.get('label.success.planDuplicate'));
    }, this);

    PlanRiskStore.on('fail', () => this.setState({ waitingSubmit: false }));

    this.loadData(planRiskId);
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
    PlanRiskItemStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  loadData(planRiskId) {
    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_RETRIEVE_PLANRISK,
      data: planRiskId,
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_FIND_BY_PLAN,
      data: planRiskId,
    });

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_GET_ALL_ITEMS,
      data: { planRiskId },
    }, this);
  }

  onChangeHandler = (newPlanRisk) => {
    this.setState({ newPlanRisk });
  }

  onSubmit = () => {
    const {
      planRisk,
      newPlanRisk,
      items,
      units,
    } = this.state;

    const onSuccess = () => (
      PlanRiskStore.newPlanRisk({
        ...planRisk,
        policy: {
          id: planRisk.policy.id,
        },
        name: newPlanRisk.name,
        description: newPlanRisk.description,
      })
    );

    validationClonePlanRisk(newPlanRisk, items, units, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.title.clonePlanRisk')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const {
      newPlanRisk,
      planRisk,
      units,
      items,
      errors,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.cloneInfo') }]}
          topContainerContent={{ title: Messages.get('label.cloneInfo') }}
        >
          <TabbedPanel.MainContainer>
            {
              planRisk && units && items ? (
                <ClonePlanRiskForm
                  errors={errors}
                  planRisk={planRisk}
                  newPlanRisk={newPlanRisk}
                  units={units}
                  items={items}
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

ClonePlanRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

ClonePlanRisk.propTypes = {
  params: PropTypes.shape({
    planRiskId: PropTypes.string.isRequired,
  }).isRequired,
};

export default ClonePlanRisk;
