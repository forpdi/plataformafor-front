import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import ReplyableMessageModal from 'forpdi/src/components/modals/userMessage/ReplyableMessageModal';
import Modal from 'forpdi/src/components/modals/Modal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';
import { parseRoutePathToLink } from 'forpdi/src/utils/urlUtil';
import { splitNotificationMessage } from 'forpdi/src/for/helpers/notificationHelper';
import { htmlStringToSimpleText } from 'forpdi/src/utils/util';

import Messages from 'forpdi/src/Messages';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';

const NotificationsTable = (
  {
    notifications,
    onSort,
    sortedBy,
  }, { theme, router, toastr },
) => {
  function deleteNotification(notification) {
    const { id: notificationId } = notification;

    UserSession.dispatch({
      action: UserSession.ACTION_SET_NOTIFICATION_DELETED,
      data: {
        notificationId,
      },
    });
  }

  function onRedirect(rowData) {
    const { id: notificationId, url } = rowData;

    const isNotificationMessage = !url;

    if (isNotificationMessage) {
      showMessageModal(notificationId);
    } else {
      UserSession.dispatch({
        action: UserSession.ACTION_SET_NOTIFICATION_RESPONDED,
        data: notificationId,
      });
      router.replace(parseRoutePathToLink(url));
    }
  }

  function showMessageModal(notificationId) {
    const messageModal = (
      <ReplyableMessageModal
        notificationId={notificationId}
        toastr={toastr}
      />
    );
    Modal.show(messageModal, theme);
  }

  function renderTable() {
    const renderSubject = (notification) => {
      const { vizualized } = notification;
      const { subject } = splitNotificationMessage(notification);

      return (
        vizualized
          ? <span>{htmlStringToSimpleText(subject)}</span>
          : <b>{htmlStringToSimpleText(subject)}</b>
      );
    };

    const renderSender = (notification) => {
      const { vizualized } = notification;
      const { sender } = splitNotificationMessage(notification);

      return (
        vizualized
          ? <span>{sender}</span>
          : <b>{sender}</b>
      );
    };

    const renderDate = (notification) => {
      const { creation, vizualized } = notification;
      const { date } = splitDateTime(creation);

      return (
        vizualized
          ? <span>{date}</span>
          : <b>{date}</b>
      );
    };

    const renderStatus = (notification) => {
      const { responded, vizualized, url } = notification;

      if (responded && !url) return 'Respondido';
      if (vizualized) return 'Visualizado';
      return <b>Não visualizado</b>;
    };

    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deleteNotificationConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteNotification(data)}
        />
      );
      Modal.show(confirmModal, theme);
    };

    const columns = [
      {
        name: Messages.get('label.subject'),
        field: 'description',
        render: renderSubject,
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.sender'),
        field: 'company.name',
        render: renderSender,
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.date'),
        field: 'creation',
        render: renderDate,
        width: '15%',
        sort: true,
      },
      {
        name: Messages.get('label.status'),
        field: 'status',
        render: renderStatus,
        width: '20%',
      },
    ];

    const actionColumnItems = [
      {
        icon: 'trash',
        title: Messages.get('label.deleteNotification'),
        action: onHandleRenderDeleteModal,
      },
    ];

    return (
      <Table
        data={notifications}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
        theme={theme}
      />
    );
  }

  return renderTable();
};

NotificationsTable.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
};

NotificationsTable.defaultProps = {
  sortedBy: null,
};

NotificationsTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NotificationsTable;
