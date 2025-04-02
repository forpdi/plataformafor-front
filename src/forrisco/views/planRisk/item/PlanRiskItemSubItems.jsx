import React from 'react';
import PropTypes from 'prop-types';

import ItemSubItems from 'forpdi/src/forrisco/components/item/ItemSubItems';

import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';

const PlanRiskItemSubItems = (
  { params, subitemsData },
  { router, hasForriscoManagePolicyPermission },
) => {
  function onNew() {
    const { planRiskId, itemId } = params;
    router.push(`forrisco/plan-risk/${planRiskId}/item/${itemId}/subitem/new`);
  }

  function onEdit(item) {
    const { id: itemId } = item;
    router.push(`forrisco/plan-risk/subitem/${itemId}/edit`);
  }

  function onDelete(subItem) {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DELETE_SUBITEM,
      data: subItem.id,
    });
  }

  function handleRedirect(subItem) {
    const { planRiskId, itemId } = params;
    const { id: subitemId } = subItem;
    router.push(`/forrisco/plan-risk/${planRiskId}/item/${itemId}/subitem/${subitemId}/info`);
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

PlanRiskItemSubItems.propTypes = {
  params: PropTypes.shape({
    policyId: PropTypes.string,
    itemId: PropTypes.string,
  }).isRequired,
  subitemsData: PropTypes.arrayOf(PropTypes.shape({})),
};

PlanRiskItemSubItems.defaultProps = {
  subitemsData: [],
};

PlanRiskItemSubItems.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

export default PlanRiskItemSubItems;
