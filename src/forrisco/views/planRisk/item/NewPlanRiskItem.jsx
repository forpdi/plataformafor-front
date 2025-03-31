import React from 'react';
import PropTypes from 'prop-types';

import NewItem from 'forpdi/src/forrisco/components/item/NewItem';

import Messages from 'forpdi/src/Messages';
import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';

class NewPlanRiskItem extends React.Component {
  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { planRiskId } = params;

    PlanRiskItemStore.on('itemSaved', () => {
      toastr.addAlertSuccess(Messages.get('label.successNewItem'));
      router.push(`/forrisco/plan-risk/${planRiskId}/itens`);
    }, this);

    PlanRiskItemStore.on('subItemSaved', () => {
      toastr.addAlertSuccess(Messages.get('label.successNewSubitem'));
      router.goBack();
    }, this);
  }

  componentWillUnmount() {
    PlanRiskItemStore.off(null, null, this);
  }

  onSubmitNewItem = (item) => {
    const { params } = this.props;
    const { planRiskId } = params;

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_SAVE_ITEMS,
      data: {
        ...item,
        planRisk: { id: planRiskId },
      },
    });
  }

  onSubmitNewSubItem = (item) => {
    const { item: planRiskItem } = item;
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_SAVE_SUBITEMS,
      data: {
        ...item,
        planRiskItem,
      },
    });
  }

  render() {
    const { params } = this.props;

    return (
      <NewItem
        params={params}
        onSubmitNewItem={this.onSubmitNewItem}
        onSubmitNewSubitem={this.onSubmitNewSubItem}
      />
    );
  }
}

NewPlanRiskItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewPlanRiskItem.propTypes = {
  params: PropTypes.shape({}).isRequired,
};


export default NewPlanRiskItem;
