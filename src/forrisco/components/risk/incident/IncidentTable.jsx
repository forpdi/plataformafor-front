import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

import Messages from 'forpdi/src/Messages';
import { htmlStringToSimpleText } from 'forpdi/src/utils/util';
import { getManagerDisplayName, isResponsibleForItemOrRiskOrHasPermission } from 'forpdi/src/forrisco/helpers/riskHelper';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const IncidentTable = ({
  incidents,
  onSort,
  sortedBy,
  risk,
}, { router, hasForriscoManageRiskItemsPermission }) => {
  function deleteIncident(incident) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE_INCIDENT,
      data: {
        incidentId: incident.id,
      },
    });
  }

  function onRedirect(incident) {
    router.push(`/forrisco/risk/${risk.id}/incident/${incident.id}/info`);
  }

  function renderResponsible(incident) {
    const { user } = incident;
    return (<p>{user.name}</p>);
  }

  function renderManager(incident) {
    const { manager } = incident;
    return (<p>{getManagerDisplayName(manager)}</p>);
  }

  function renderType(incident) {
    const { type } = incident;
    return (<p>{riskType[type].label}</p>);
  }

  function renderDescription(incident) {
    const { description } = incident;
    const text = htmlStringToSimpleText(description);
    return (
      <span>
        {cutPhrase(text, 100)}
      </span>
    );
  }

  function renderAction(incident) {
    const { action } = incident;
    return (
      <span>
        {cutPhrase(action, 100)}
      </span>
    );
  }

  function onEdit(incident) {
    router.push(`/forrisco/risk/${risk.id}/incidents/edit/${incident.id}`);
  }

  function renderTable() {
    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deleteIncidentConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteIncident(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const columns = [
      {
        name: Messages.get('label.description'),
        field: 'description',
        render: renderDescription,
        width: '25%',
        sort: true,
      },
      {
        name: Messages.get('label.correctionalActions'),
        field: 'action',
        render: renderAction,
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.typeLegend'),
        field: 'type',
        render: renderType,
        width: '10%',
        sort: true,
      },
      {
        name: Messages.get('label.responsible'),
        field: 'user.name',
        render: renderResponsible,
        width: '10%',
        sort: true,
      },
      {
        name: Messages.get('label.manager'),
        field: 'manager.name',
        render: renderManager,
        width: '10%',
        sort: true,
      },
      {
        name: Messages.get('label.dateTime'),
        field: 'begin',
        width: '20%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editIncident'),
        action: onEdit,
        disabled: rowData => !isResponsibleForItemOrRiskOrHasPermission(
          rowData, risk, hasForriscoManageRiskItemsPermission,
        ),
      },
      {
        icon: 'trash',
        title: Messages.get('label.deletetIncident'),
        action: onHandleRenderDeleteModal,
        disabled: !isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission),
      },
    ];

    return (
      <Table
        data={incidents}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        redirect={onRedirect}
        stickyTopHead={TabbedPanel.nextTopSticky}
      />
    );
  }

  return incidents ? renderTable() : <LoadingGauge />;
};

IncidentTable.propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
};

IncidentTable.defaultProps = {
  incidents: null,
  sortedBy: null,
};

IncidentTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

export default IncidentTable;
