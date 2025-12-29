import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import ItemTable from 'forpdi/src/forrisco/components/item/ItemTable';

import Messages from 'forpdi/src/Messages';

const subitemsRowId = 1;

const ItemNestedRow = ({
  subitems,
  id: parentItemId,
  onNewSubitem,
  onDelete,
  onEdit,
  onRedirect,
  hasPermission,
}) => {
  function onNewSubitemHandler() {
    onNewSubitem(parentItemId);
  }

  function renderTable() {
    const columns = [{
      field: 'label',
      width: '100%',
      render: rowData => (
        <span style={{ textTransform: 'uppercase' }}>{rowData.label}</span>
      ),
    }];

    const actionColumnItems = [];

    if (hasPermission) {
      actionColumnItems.push(
        { icon: 'plus', title: Messages.get('label.new'), action: onNewSubitemHandler },
      );
    }

    actionColumnItems.push(
      { icon: 'chevron-right', title: Messages.get('label.viewMore'), expandNestedRow: true },
    );

    const data = [
      { label: Messages.get('label.subitems'), id: subitemsRowId },
    ];

    return (
      <Table
        data={data}
        columns={columns}
        actionColumnItems={actionColumnItems}
        nestedComponentRender={nestedComponentRender}
        showHeader={false}
        nestingLevel={2}
      />
    );
  }

  function nestedComponentRender(rowData) {
    if (rowData.id === subitemsRowId) {
      return (
        <ItemTable
          items={subitems}
          showHeader={false}
          nestingLevel={3}
          onDelete={onDelete}
          onEdit={onEdit}
          onRedirect={onRedirect}
          hasPermission={hasPermission}
        />
      );
    }

    return null;
  }

  return renderTable();
};

ItemNestedRow.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

ItemNestedRow.propTypes = {
  id: PropTypes.number.isRequired,
  params: PropTypes.shape({}),
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onNewSubitem: PropTypes.func.isRequired,
  subitems: PropTypes.arrayOf(PropTypes.shape({})),
  onRedirect: PropTypes.func.isRequired,
};

ItemNestedRow.defaultProps = {
  subitems: null,
  params: null,
};

export default ItemNestedRow;
