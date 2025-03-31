import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';
import Modal from 'forpdi/src/components/modals/Modal';

const ItemTable = ({
  items,
  nestedComponentRender,
  showHeader,
  nestingLevel,
  onRedirect,
  onDelete,
  onEdit,
  hasPermission,
  onSort,
  sortedBy,
}) => {
  function renderTable() {
    const renderFieldName = (item) => {
      const { hasFile, hasText } = item;
      return (
        <span>
          {!hasText && !hasFile && Messages.get('label.noInformation')}
          {hasText && 'Texto'}
          {hasText && hasFile && '/'}
          {hasFile && 'Arquivo'}
        </span>
      );
    };

    const onHandleRenderDeleteModal = (data) => {
      let modalText;
      if (nestingLevel === 1) {
        modalText = Messages.get('label.deleteItemConfirmation');
      } else {
        modalText = Messages.get('label.deleteSubitemConfirmation');
      }
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => onDelete(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const columns = [
      {
        name: Messages.get('label.itemName'), field: 'name', width: '55%', sort: true,
      },
      {
        name: Messages.get('label.typeLegend'), field: 'fileType', render: renderFieldName, width: '35%',
      },
    ];

    const actionColumnItems = [];

    if (hasPermission) {
      actionColumnItems.push({ icon: 'pen', title: Messages.get('label.editItem'), action: onEdit });
      actionColumnItems.push({ icon: 'trash', title: Messages.get('label.deleteItem'), action: onHandleRenderDeleteModal });
    }

    if (nestedComponentRender) {
      actionColumnItems.push(
        { icon: 'chevron-right', title: Messages.get('label.viewMore'), expandNestedRow: true },
      );
    }

    return (
      <Table
        data={items}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems.length > 0 ? actionColumnItems : null}
        nestedComponentRender={nestedComponentRender}
        showHeader={showHeader}
        nestingLevel={nestingLevel}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
      />
    );
  }

  return items ? renderTable() : <LoadingGauge />;
};

ItemTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

ItemTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})),
  nestedComponentRender: PropTypes.func,
  showHeader: PropTypes.bool,
  nestingLevel: PropTypes.number,
  onRedirect: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool,
  onSort: PropTypes.func,
  sortedBy: PropTypes.shape({}),
};

ItemTable.defaultProps = {
  items: null,
  showHeader: true,
  nestingLevel: 1,
  onRedirect: null,
  nestedComponentRender: null,
  hasPermission: null,
  onSort: null,
  sortedBy: null,
};


export default ItemTable;
