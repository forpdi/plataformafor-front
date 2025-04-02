import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';


import Messages from 'forpdi/src/Messages';

const SubunitsTable = (
  {
    subunits,
    onSort,
    sortedBy,
    isNested,
  },
  { router, hasForriscoManageUnitPermission, hasForriscoEditUnitPermission },
) => {
  function deleteSubunit(subunit) {
    UnitStore.dispatch({
      data: subunit,
      action: UnitStore.ACTION_DELETE_SUBUNIT,
    });
  }

  function onHandleRedirect(data) {
    router.push(`/forrisco/subunit/${data.id}`);
  }

  function onEdit(unit) {
    router.push(`/forrisco/unit/edit/${unit.id}`);
  }

  function getColumns() {
    const renderResponsible = data => (
      <span>{data.user.name}</span>
    );

    return isNested ? [
      {
        name: Messages.get('label.subunitys'),
        field: 'name',
        width: '90%',
        renderHead: name => <span>{name}</span>,
      },
    ] : [
      {
        name: Messages.get('label.unityName'),
        field: 'name',
        width: '60%',
        sort: true,
      }, {
        name: Messages.get('label.responsible'),
        field: 'user.name',
        render: renderResponsible,
        width: '30%',
        sort: true,
      },
    ];
  }

  function renderTable() {
    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deleteUnitConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteSubunit(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editUnit'),
        action: onEdit,
        disabled: rowData => !hasForriscoEditUnitPermission && !isResponsible(rowData),
      },
      {
        icon: 'trash',
        title: Messages.get('label.deleteUnit'),
        action: onHandleRenderDeleteModal,
        disabled: !hasForriscoManageUnitPermission,
      },
    ];

    return (
      <Table
        data={subunits}
        columns={getColumns()}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems.length > 0 ? actionColumnItems : null}
        stickyTopHead={!isNested ? TabbedPanel.nextTopSticky : null}
        nestingLevel={isNested ? 2 : 1}
        renderActionColumnHeader={isNested ? () => null : null}
        redirect={onHandleRedirect}
      />
    );
  }

  return subunits ? renderTable() : <LoadingGauge />;
};

SubunitsTable.propTypes = {
  subunits: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func,
  sortedBy: PropTypes.shape({}),
  isNested: PropTypes.bool,
};

SubunitsTable.defaultProps = {
  subunits: null,
  onSort: null,
  sortedBy: null,
  isNested: false,
};

SubunitsTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
  hasForriscoEditUnitPermission: PropTypes.bool.isRequired,
};

export default SubunitsTable;
