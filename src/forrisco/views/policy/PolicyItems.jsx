import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import ItemTable from 'forpdi/src/forrisco/components/item/ItemTable';
import ItemNestedRow from 'forpdi/src/forrisco/components/item/ItemNestedRow';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import ItemStore from 'forpdi/src/forrisco/stores/Item';
import Messages from 'forpdi/src/Messages';

const itemsNestingLevel = 1;

class PolicyItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredItems: null,
    };
  }

  componentDidMount() {
    const { onItemsChange, items: filteredItems } = this.props;
    const { toastr } = this.context;

    ItemStore.on('itemDeleted', ({ data }) => {
      const { items } = this.props;
      const updateditems = _.filter(items, ({ id }) => data.id !== id);

      toastr.addAlertSuccess(Messages.get('label.notification.item.delete'));
      onItemsChange(updateditems);
    }, this);

    ItemStore.on('subitemDeleted', ({ data }) => {
      const { id: itemId } = data.item;
      const { items } = this.props;
      const item = _.find(items, ({ id }) => id === itemId);
      const updatedSubitems = _.filter(item.subitems, ({ id }) => data.id !== id);
      item.subitems = updatedSubitems;

      onItemsChange(items);

      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
    }, this);

    this.setState({
      filteredItems,
    });
  }

  componentWillUnmount() {
    ItemStore.off(null, null, this);
  }

  onHandleRedirect = (data) => {
    const { router } = this.context;
    const { params } = this.props;
    const { policyId } = params;
    router.push(`/forrisco/policy/${policyId}/item/${data.id}/info`);
  }

  onHandleRedirectSubitem = (data) => {
    const { router } = this.context;
    const { params } = this.props;
    const { policyId } = params;
    const { id: subItemId } = data;
    router.push(`/forrisco/policy/${policyId}/item/${data.id}/subitem/${subItemId}/info`);
  }

  onNewItem = () => {
    const { params } = this.props;
    const { router } = this.context;
    const { policyId } = params;

    router.push(`forrisco/policy/${policyId}/item/new`);
  }

  onDelete = (item) => {
    const hasParentItem = item.itemId;
    ItemStore.dispatch({
      action:
        hasParentItem
          ? ItemStore.ACTION_DELETE_SUB
          : ItemStore.ACTION_DELETE,
      data: item.id,
    });
  }

  onEdit = (item) => {
    const hasParentItem = item.itemId;
    const { router } = this.context;
    const { id: itemId } = item;

    hasParentItem
      ? router.push(`forrisco/policy/subitem/${itemId}/edit`)
      : router.push(`forrisco/policy/item/${itemId}/edit`);
  }

  onNewSubitem = (parentItemId) => {
    const { router } = this.context;
    const { params } = this.props;
    const { policyId } = params;

    router.push(`forrisco/policy/${policyId}/item/${parentItemId}/subitem/new`);
  }

  nestedComponentRender = (props) => {
    const { hasForriscoManagePolicyPermission } = this.context;
    const { id: itemId } = props;
    const { items } = this.props;
    const { subitems } = _.find(items, ({ id }) => id === itemId);

    return (
      <ItemNestedRow
        {...props}
        onDelete={this.onDelete}
        onNewSubitem={this.onNewSubitem}
        subitems={subitems}
        onEdit={this.onEdit}
        onRedirect={this.onHandleRedirectSubitem}
        hasPermission={hasForriscoManagePolicyPermission}
      />
    );
  }

  render() {
    const { filteredItems } = this.state;
    const { items } = this.props;
    const { hasForriscoManagePolicyPermission } = this.context;

    if (!items) {
      return <LoadingGauge />;
    }

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.items')}</SecondaryTitle>
          {
            hasForriscoManagePolicyPermission && (
              <PrimaryButton
                text={Messages.get('label.itemRiskRegister')}
                title={Messages.get('label.itemRiskRegister')}
                onClick={this.onNewItem}
              />
            )
          }
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <ItemTable
            items={filteredItems || items}
            nestedComponentRender={this.nestedComponentRender}
            onRedirect={this.onHandleRedirect}
            onDelete={this.onDelete}
            nestingLevel={itemsNestingLevel}
            onEdit={this.onEdit}
            hasPermission={hasForriscoManagePolicyPermission}
          />
        </TabbedPanel.MainContainer>
      </div>
    );
  }
}

PolicyItems.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

PolicyItems.propTypes = {
  params: PropTypes.shape({}),
  onItemsChange: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape()),
};

PolicyItems.defaultProps = {
  params: {},
  items: null,
  onItemsChange: null,
};

export default PolicyItems;
