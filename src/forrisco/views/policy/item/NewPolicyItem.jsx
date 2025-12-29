import React from 'react';
import PropTypes from 'prop-types';

import NewItem from 'forpdi/src/forrisco/components/item/NewItem';

import Messages from 'forpdi/src/Messages';
import ItemStore from 'forpdi/src/forrisco/stores/Item';

class NewPolicyItem extends React.Component {
  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { policyId } = params;

    ItemStore.on('newItem', () => {
      toastr.addAlertSuccess(Messages.get('label.successNewItem'));
      router.push(`/forrisco/policy/${policyId}/item/overview`);
    }, this);

    ItemStore.on('newSubItem', () => {
      toastr.addAlertSuccess(Messages.get('label.successNewSubitem'));
      router.goBack();
    }, this);
  }

  componentWillUnmount() {
    ItemStore.off(null, null, this);
  }

  onSubmitNewItem = (item) => {
    const { params } = this.props;
    const { policyId } = params;

    ItemStore.dispatch({
      action: ItemStore.ACTION_NEW_ITEM,
      data: {
        ...item,
        policy: { id: policyId },
      },
    });
  }

  onSubmitNewSubItem = (item) => {
    ItemStore.dispatch({
      action: ItemStore.ACTION_NEW_SUBITEM,
      data: item,
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

NewPolicyItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewPolicyItem.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default NewPolicyItem;
