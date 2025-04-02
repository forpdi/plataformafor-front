import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';
import InfoButton from 'forpdi/src/components/buttons/InfoButton';
import RiskResponseInfoModal from 'forpdi/src/forrisco/components/risk/RiskResponseInfoModal';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';
import CircleStatus from 'forpdi/src/forrisco/components/dashboard/CircleStatus';
import riskState from 'forpdi/src/forrisco/enums/riskState';

const RisksTable = (
  {
    risks,
    onSort,
    sortedBy,
    nestingLevel,
  },
  { router, hasForriscoManageRiskPermission },
) => {
  function deleteRisk(risk) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE,
      data: risk.id,
    });
  }

  function archiveRisk(risk) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_ARCHIVE,
      data: risk.id,
    });
  }

  function unarchiveRisk(risk) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_UNARCHIVE,
      data: risk.id,
    });
  }

  function onRedirect(risk) {
    const { id } = risk;
    router.push(`/forrisco/risk/${id}/details`);
  }

  function onHandleEdit(risk) {
    const { id } = risk;
    router.push(`/forrisco/risk/edit/${id}`);
  }

  function onHandleReplicate(risk) {
    const { id } = risk;
    router.push(`/forrisco/risk/replicate/${id}`);
  }

  function onHandleMove(risk) {
    const { id } = risk;
    router.push(`/forrisco/risk/move/${id}`);
  }

  function renderMonitoring(risk) {
    const { monitoringState } = risk;
    return (
      <CircleStatus
        title={riskState[monitoringState].label}
        color={riskState[monitoringState].color}
      />
    );
  }

  function renderTable() {
    const renderResponsible = (risk) => {
      const { user } = risk;
      return <span>{user.name}</span>;
    };

    function renderManager(risk) {
      const { manager } = risk;
      return (
        <span>
          {getManagerDisplayName(manager)}
        </span>
      );
    }

    function renderResponse(risk) {
      const { response } = risk;
      if (response) {
        const riskResponse = riskResponseEnum[response];
        return riskResponse.id === riskResponseEnum.share.id
          ? Messages.get('label.shared')
          : riskResponse.name;
      }

      return Messages.get('label.uninformed');
    }

    const onHandleArchiveModal = (data) => {
      const { name, archived } = data;
      const status = archived ? 'publicado' : 'arquivado';
      const modalText = `O risco '${name}' será ${status}. Deseja continuar?`;
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => (archived ? unarchiveRisk(data) : archiveRisk(data))}
        />
      );
      Modal.show(confirmModal);
    };

    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deleteRiskConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteRisk(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const showRiskResponseInfo = () => {
      const riskResponseInfoModal = (
        <RiskResponseInfoModal />
      );
      Modal.show(riskResponseInfoModal);
    };

    const columns = [
      {
        name: Messages.get('label.riskName'),
        field: 'name',
        width: '40%',
        sort: true,
      },
      {
        name: Messages.get('label.responsible'),
        field: 'user.name',
        render: renderResponsible,
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.manager'),
        field: 'manager.name',
        render: renderManager,
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.riskResponse'),
        render: renderResponse,
        width: '10%',
        renderHead: name => (
          <span>
            {name}
            <InfoButton style={{ marginLeft: '5px' }} onClick={showRiskResponseInfo} />
          </span>
        ),
      },
      {
        name: Messages.get('label.monitoring'),
        render: renderMonitoring,
        renderHead: name => (
          <div style={{ textAlign: 'center', width: '100%' }}>{name}</div>
        ),
        width: '10%',
      },
    ];

    const actionColumnItems = [
      {
        icon: 'share',
        title: Messages.get('label.moveRisk'),
        action: onHandleMove,
        disabled: rowData => !hasForriscoManageRiskPermission || rowData.archived,
      },
      {
        icon: 'clone',
        title: Messages.get('label.replicateRisk'),
        action: onHandleReplicate,
        disabled: !hasForriscoManageRiskPermission,
      },
      {
        icon: 'pen',
        title: Messages.get('label.editRisk'),
        action: onHandleEdit,
        disabled: rowData => (!hasForriscoManageRiskPermission && !isResponsible(rowData))
                              || rowData.archived,
      },
      {
        icon: rowData => riskArchivedStatus[rowData.archived].iconName,
        title: rowData => riskArchivedStatus[rowData.archived].action,
        action: onHandleArchiveModal,
        disabled: !hasForriscoManageRiskPermission,
      },
      {
        icon: 'trash',
        title: Messages.get('label.deleteRisk'),
        action: onHandleRenderDeleteModal,
        disabled: rowData => !hasForriscoManageRiskPermission || rowData.archived,
      },
    ];

    return (
      <Table
        data={risks}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        nestingLevel={nestingLevel}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
      />
    );
  }

  return risks ? renderTable() : <LoadingGauge />;
};

RisksTable.propTypes = {
  risks: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  nestingLevel: PropTypes.number,
};

RisksTable.defaultProps = {
  risks: null,
  sortedBy: null,
  nestingLevel: 1,
};

RisksTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

export default RisksTable;
