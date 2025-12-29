import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';
import MessageModal from 'forpdi/src/components/modals/userMessage/MessageModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';

const MessagesTable = (
  {
    messages,
    onSort,
    sortedBy,
  }, { theme },
) => {
  function onRedirect(rowData) {
    const messageModal = (
      <MessageModal
        messageData={rowData}
      />
    );

    Modal.show(messageModal, theme);
  }

  function renderTable() {
    const renderReceiver = (message) => {
      const { name: receiver } = message.userReceiver;

      return (
        <span>{receiver}</span>
      );
    };

    const renderDate = (message) => {
      const { creation } = message;
      const { date } = splitDateTime(creation);

      return (
        <span>{date}</span>
      );
    };

    const columns = [
      {
        name: Messages.get('label.subject'),
        field: 'subject',
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.receiver'),
        field: 'userReceiver',
        render: renderReceiver,
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
    ];

    return (
      <Table
        data={messages}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
      />
    );
  }

  return renderTable();
};

MessagesTable.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
};

MessagesTable.defaultProps = {
  sortedBy: null,
};

MessagesTable.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

export default MessagesTable;
