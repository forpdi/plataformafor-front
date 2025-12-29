import React from 'react';
import PropTypes from 'prop-types';

import EditItem from 'forpdi/src/forrisco/components/item/EditItem';
import { parseToFormOption } from 'forpdi/src/forrisco/helpers/itemHelper';

import Messages from 'forpdi/src/Messages';
import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditPlanRiskItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { itemId, subitemId } = params;

    PlanRiskItemStore.on('detailItem', ({ data }) => {
      this.setState({
        item: {
          ...data,
          itemFields: parseToFormOption(data.fields),
        },
      });
    }, this);

    PlanRiskItemStore.on('detailSubItem', ({ data }) => {
      this.setState({
        item: {
          ...data,
          itemFields: parseToFormOption(data.fields),
        },
      });
    }, this);

    PlanRiskItemStore.on('itemUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    PlanRiskItemStore.on('subitemUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    itemId
      ? this.getItem(itemId)
      : this.getSubitem(subitemId);
  }

  getItem(itemId) {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DETAIL_ITEM,
      data: { id: itemId },
    });
  }

  getSubitem(subitemId) {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DETAIL_SUBITEM,
      data: { id: subitemId },
    });
  }

  isSubitem = () => {
    const { item } = this.state;
    const { planRiskItem } = item;

    return !!planRiskItem;
  }

  componentWillUnmount() {
    PlanRiskItemStore.off(null, null, this);
  }

  onChangeHandler = (item) => {
    this.setState({
      item,
    });
  }

  onSubmit = (updatedItem) => {
    this.isSubitem()
      ? this.submitUpdatedSubitem(updatedItem)
      : this.submitUpdatedItem(updatedItem);
  }

  submitUpdatedItem = (updatedItem) => {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_UPDATE_ITEM,
      data: updatedItem,
    });
  }

  submitUpdatedSubitem = (updatedItem) => {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_UPDATE_SUBITEM,
      data: updatedItem,
    });
  }

  render() {
    const { item } = this.state;

    if (!item) {
      return <LoadingGauge />;
    }

    return (
      <EditItem
        item={item}
        onSubmit={this.onSubmit}
        onChange={this.onChangeHandler}
        isSubitem={this.isSubitem}
      />
    );
  }
}

EditPlanRiskItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPlanRiskItem.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default EditPlanRiskItem;
