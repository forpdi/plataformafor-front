import _ from 'underscore';
import { parseDate, splitDateTime, parseTime } from 'forpdi/src/utils/dateUtil';

export function isolateSelectedNotification(notifications, selectedId) {
  const unchangedNotifications = _.filter(
    notifications, notification => notification.id !== selectedId,
  );

  const selectedNotification = _.find(
    notifications, notification => notification.id === selectedId,
  );

  return [selectedNotification, unchangedNotifications];
}

export function splitNotificationMessage(notification) {
  const { description, url, company } = notification;

  if (url) {
    const subject = description;
    const sender = company.name;
    return { sender, subject };
  }

  const splitMessage = description.split(/\.|:/g);

  const sender = splitMessage[0].split(/ /g)[2];
  const subject = splitMessage[1];

  return { sender, subject };
}

export function orderNotifications(notifications) {
  return notifications.sort((a, b) => !a.vizualized
    || !b.vizualized
    || parseDate(splitDateTime(b.creation).date) - parseDate(splitDateTime(a.creation).date)
    || parseTime(splitDateTime(b.creation).time) - parseTime(splitDateTime(a.creation).time));
}
