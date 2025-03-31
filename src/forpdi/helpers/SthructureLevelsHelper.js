import _ from 'underscore';

import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";

export function hasAddAndDeletetructureItemPermission(roles, permissions, isResponsible, isGoal) {
  return roles.ADMIN
      || (roles.MANAGER && isResponsible)
      || (roles.MANAGER && isGoal)
      || _.contains(permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION);
};

export function hasPermissionToFinishGoalAndEditFields(roles, permissions, isResponsible) {
  return roles.ADMIN
      || (roles.MANAGER && isResponsible)
      || _.contains(permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION);
};

export function hasEditStructureItemPermission(roles, permissions, isResponsible) {
  return roles.MANAGER
      || isResponsible
      || _.contains(permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION);
};

export function isResponsibleForSomeParent(parents) {
  const userId = UserSession.get("user").id;

  if (parents) {
    for(let i = 0; i < parents.length; i++) {
      if (parents[i].responsibleId && parents[i].responsibleId == userId) {
        return true;
      }
    }
  }

  return false;
};
