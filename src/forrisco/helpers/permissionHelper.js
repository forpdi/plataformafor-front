import _ from 'underscore';

import UserSession from 'forpdi/src/forpdi/core/store/UserSession';

export function isResponsibleOrHasPermission(itemData, hasPermission) {
  return isResponsible(itemData) || hasPermission;
}

export function isResponsible(itemData) {
  const { user } = itemData;

  return _.isEqual(user, UserSession.get('user'));
}
