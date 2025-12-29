import React from 'react';
import PropTypes from 'prop-types';

import EditItem from 'forpdi/src/forrisco/components/item/EditItem';
import { parseToFormOption } from 'forpdi/src/forrisco/helpers/itemHelper';

import Messages from 'forpdi/src/Messages';
import ItemStore from 'forpdi/src/forrisco/stores/Item';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditPolicyItem extends React.Component {
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

    ItemStore.on('retrieveItem', ({ attributes }) => {
      this.setState({
        item: {
          ...attributes,
          itemFields: parseToFormOption(attributes.fields),
        },
      });
    }, this);

    ItemStore.on('retrieveSubitem', ({ data }) => {
      this.setState({
        item: {
          ...data,
          itemFields: parseToFormOption(data.fields),
        },
      });
    }, this);

    ItemStore.on('itemUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    ItemStore.on('subitemUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
    }, this);

    itemId
      ? this.getItem(itemId)
      : this.getSubitem(subitemId);
  }

  getItem(itemId) {
    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_ITEM,
      data: itemId,
    });
  }

  getSubitem(subitemId) {
    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_SUBITEM,
      data: subitemId,
    });
  }

  isSubitem = () => {
    const { item } = this.state;
    const { item: parent } = item;

    return !!parent;
  }

  componentWillUnmount() {
    ItemStore.off(null, null, this);
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
    ItemStore.dispatch({
      action: ItemStore.ACTION_CUSTOM_UPDATE,
      data: updatedItem,
    });
  }

  submitUpdatedSubitem = (updatedItem) => {
    ItemStore.dispatch({
      action: ItemStore.ACTION_CUSTOM_UPDATE_SUB,
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
      />
    );
  }
}

EditPolicyItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPolicyItem.propTypes = {
  params: PropTypes.shape({}),
};

EditPolicyItem.defaultProps = {
  params: {},
};

export default EditPolicyItem;
