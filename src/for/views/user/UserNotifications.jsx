import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import NotificationsTable from 'forpdi/src/for/components/user/NotificationsTable';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';

import { parseSortedByToList } from 'forpdi/src/utils/util';
import { orderNotifications, isolateSelectedNotification } from 'forpdi/src/for/helpers/notificationHelper';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import Messages from 'forpdi/src/Messages';

class UserNotifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notifications: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      sortedBy: null,
      total: null,
    };
  }

  componentDidMount() {
    const { page, pageSize, sortedBy } = this.state;

    UserSession.on('retrieve-showMoreNotifications', (response) => {
      const { data, total } = response;
      this.setState({ notifications: data, total });
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

    UserSession.on('setNotificationDeleted', (response) => {
      const { notifications } = this.state;
      const { id: deletedNotificationId } = response.data;

      const filteredNotifications = _.filter(
        notifications, notification => notification.id !== deletedNotificationId,
      );

      this.setState({ notifications: filteredNotifications });
    }, this);

    UserSession.on('retrieve-limitedNotifications', ({ total }) => {
      if (total > 0) this.findNotifications(page, pageSize, sortedBy);
    }, this);

    UserSession.on('setResponded', ({ data }) => {
      const { id: notificationId } = data;
      const { notifications } = this.state;

      const [
        selectedNotification,
        unchangedNotifications,
      ] = isolateSelectedNotification(notifications, notificationId);

      if (!selectedNotification) {
        return;
      }

      const respondedNotification = {
        ...selectedNotification,
        responded: true,
      };

      this.setState({
        notifications: orderNotifications([
          ...unchangedNotifications,
          respondedNotification,
        ]),
      });
    }, this);


    this.findNotifications(page, pageSize, sortedBy);
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  pageChange = (page, pageSize) => {
    const { sortedBy } = this.state;
    this.setState({
      page,
      pageSize,
      notifications: null,
    }, () => this.findNotifications(page, pageSize, sortedBy));
  }

  cleanNotifications = () => {
    UserSession.dispatch({
      action: UserSession.ACTION_DELETE_NOTIFICATIONS,
    });
    this.setState({ notifications: [], page: 0, total: 0 });
  }

  onHandleCleanNotificationsModal = () => {
    const modalText = Messages.get('label.deleteAllNotificationConfirmation');
    const { theme } = this.context;
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.cleanNotifications()}
      />
    );
    Modal.show(confirmModal, theme);
  };

  findNotifications = (page, pageSize, sortedBy) => {
    this.setState({
      page,
      pageSize,
      sortedBy,
      total: null,
      notifications: null,
    });
    UserSession.dispatch({
      action: UserSession.ACTION_LIST_NOTIFICATIONS,
      data: {
        page,
        pageSize,
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  onSort = (newSortedBy) => {
    const { pageSize } = this.state;

    this.findNotifications(1, pageSize, newSortedBy);
  }


  render() {
    const { theme } = this.context;
    const {
      notifications,
      page,
      pageSize,
      sortedBy,
      total,
    } = this.state;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.notification')}</SecondaryTitle>
          {
            <PrimaryButton
              text={Messages.get('label.deleteAllNotifications')}
              title={Messages.get('label.deleteAllNotifications')}
              onClick={this.onHandleCleanNotificationsModal}
              theme={theme}
            />
          }
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {
            !notifications
              ? <LoadingGauge />
              : (
                <NotificationsTable
                  notifications={notifications}
                  onSort={this.onSort}
                  sortedBy={sortedBy}
                />
              )
          }
        </TabbedPanel.MainContainer>
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
        />
      </div>
    );
  }
}

UserNotifications.contextTypes = {
  theme: PropTypes.string.isRequired,
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default UserNotifications;
