import React from 'react';
import PropTypes from 'prop-types';

import ItemSubItems from 'forpdi/src/forrisco/components/item/ItemSubItems';

import ItemStore from 'forpdi/src/forrisco/stores/Item';

const PolicyItemSubItems = (
  { params, subitemsData },
  { router, hasForriscoManagePolicyPermission },
) => {
  function onNew() {
    const { policyId, itemId } = params;
    router.push(`forrisco/policy/${policyId}/item/${itemId}/subitem/new`);
  }

  function onDelete(subItem) {
    ItemStore.dispatch({
      action: ItemStore.ACTION_DELETE_SUB,
      data: subItem.id,
    });
  }

  function onEdit(item) {
    const { id: itemId } = item;
    router.push(`forrisco/policy/subitem/${itemId}/edit`);
  }

  function handleRedirect(data) {
    const { itemId, policyId } = params;
    const { id: subitemId } = data;
    router.push(`/forrisco/policy/${policyId}/item/${itemId}/subitem/${subitemId}/info`);
  }

  return (
    <ItemSubItems
      onNew={onNew}
      onDelete={onDelete}
      onRedirect={handleRedirect}
      subitemsData={subitemsData}
      onEdit={onEdit}
      hasPermission={hasForriscoManagePolicyPermission}
    />
  );
};

PolicyItemSubItems.propTypes = {
  params: PropTypes.shape({
    policyId: PropTypes.string,
    itemId: PropTypes.string,
  }).isRequired,
  subitemsData: PropTypes.arrayOf(PropTypes.shape({})),
};

PolicyItemSubItems.defaultProps = {
  subitemsData: null,
};

PolicyItemSubItems.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

export default PolicyItemSubItems;
