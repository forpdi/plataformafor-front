/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import NotificationTaskItem from 'forpdi/src/components/notifications/NotificationTaskItem';
import NotificationMessageItem from 'forpdi/src/components/notifications/NotificationMessageItem';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import { DROPDOWN_NOTIFICATIONS_LIMIT } from 'forpdi/src/consts';
import { orderNotifications, isolateSelectedNotification } from 'forpdi/src/for/helpers/notificationHelper';
import AppContainer from 'forpdi/src/components/AppContainer';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';

import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import Messages from 'forpdi/src/Messages';

class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notifications: null,
      totalNotifications: null,
    };
  }

  componentDidMount() {
    UserSession.on('retrieve-limitedNotifications', (model) => {
      this.setState({ notifications: model.data });
    }, this);


    UserSession.on('retrieve-limitedNotifications', ({ total }) => {
      this.setState({ totalNotifications: total });
    }, this);

    UserSession.on('notificationsDeleted', () => {
      this.setState({ notifications: [] });
    }, this);

    UserSession.on('set-notifications-visualized', () => {
      this.setState({ notifications: [] });
    }, this);

    UserSession.on('retrieve-message-by-notificationID', ({ data }) => {
      const { notifications } = this.state;
      const { id: notificationId } = data.notification;

      const [
        selectedNotification,
        unchangedNotifications,
      ] = isolateSelectedNotification(notifications, notificationId);

      if (!selectedNotification) {
        return;
      }

      const visualizedNotification = {
        ...selectedNotification,
        vizualized: true,
      };

      this.setState({
        notifications: orderNotifications([
          ...unchangedNotifications,
          visualizedNotification,
        ]),
      });
    }, this);

    UserSession.on('setNotificationDeleted', ({ data }) => {
      const { notifications } = this.state;
      const { id: notificationId } = data;

      const [
        selectedNotification,
        unchangedNotifications,
      ] = isolateSelectedNotification(notifications, notificationId);

      if (!selectedNotification) {
        return;
      }

      const deletedNotification = {
        ...selectedNotification,
        vizualized: true,
        deleted: true,
      };

      this.setState({
        notifications: orderNotifications([
          ...unchangedNotifications,
          deletedNotification,
        ]),
      });
    }, this);
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  setNotificationsVisualized() {
    UserSession.dispatch({
      action: UserSession.ACTION_SET_NOTIFICATIONS_VISUALIZED,
      data: {
        maxResults: DROPDOWN_NOTIFICATIONS_LIMIT,
      },
    });
  }

  showNotifications = () => {
    const { router } = this.context;

    router.push('/users/profile/notifications');
  }

  hasNotVisualizedNotification() {
    const { notifications } = this.state;

    return _.findWhere(notifications, { vizualized: false });
  }

  renderHeader() {
    const { onClose } = this.props;

    return (
      <div className="notifications-header">
        <SecondaryIconButton
          icon="arrow-left"
          style={{ left: 20, position: 'absolute' }}
          onClick={onClose}
        />
        <SecondaryTitle>{Messages.get('label.notification')}</SecondaryTitle>
      </div>
    );
  }

  renderFooter() {
    return (
      <div className="notifications-footer">
        <SecondaryButton
          text={Messages.get('label.seeAll')}
          title={Messages.get('label.seeAll')}
          onClick={this.showNotifications}
        />
        <SecondaryButton
          text={Messages.get('label.cleanNotifications')}
          title={Messages.get('label.cleanNotifications')}
          onClick={this.setNotificationsVisualized}
        />
      </div>
    );
  }


  renderNotifications(notifications) {
    return _.map(notifications, ({
      id, url, creation, description, vizualized,
    }) => (
      url
        ? (
          <NotificationTaskItem
            key={id}
            url={url}
            creation={creation}
            description={description}
            isNewNotification={!vizualized}
            notificationId={id}
          />
        ) : (
          <NotificationMessageItem
            key={id}
            creation={creation}
            description={description}
            notificationId={id}
            isNewNotification={!vizualized}
          />
        )
    ));
  }

  renderSideBar() {
    const { theme } = this.context;
    const { notifications, totalNotifications } = this.state;
    const { show } = this.props;

    const hasNotVisualized = this.hasNotVisualizedNotification();

    return (
      notifications ? (
        <div className={`notifications-side-bar ${show ? 'notifications-side-bar--showed' : ''}`}>
          {this.renderHeader()}
          {
            hasNotVisualized ? (
              <div style={{ flex: 1, position: 'relative' }}>
                <AppContainer.ScrollableContent
                  style={{ position: 'absolute', padding: 0 }}
                >
                  <div className="notifications-body">
                    { this.renderNotifications(notifications) }
                  </div>
                </AppContainer.ScrollableContent>
              </div>
            ) : (
              <InputContainer className={`${theme}-primary-color notification-text`}>
                {
                  totalNotifications === 0
                    ? Messages.get('notification.nullNotifications')
                    : Messages.get('notification.noNotifications')
                }
              </InputContainer>
            )
          }
          {hasNotVisualized && this.renderFooter()}
        </div>
      ) : null
    );
  }

  render() {
    const { show, onClose } = this.props;

    return (
      <div>
        {
          this.renderSideBar()
        }
        <div
          className={`notifications-overlay ${show ? 'notifications-overlay--showed' : ''}`}
          onClick={onClose}
        />
      </div>
    );
  }
}

Notifications.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

Notifications.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

export default Notifications;
