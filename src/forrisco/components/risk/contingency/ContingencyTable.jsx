import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';
import { getManagerDisplayName, isResponsibleForItemOrRiskOrHasPermission } from 'forpdi/src/forrisco/helpers/riskHelper';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';


const ContingencyTable = (
  {
    contingencies,
    onSort,
    sortedBy,
    risk,
  },
  { router, hasForriscoManageRiskItemsPermission },
) => {
  function deleteContingency(contingency) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE_CONTINGENCY,
      data: {
        contingencyId: contingency.id,
      },
    });
  }

  function onEdit(contingency) {
    router.push(`/forrisco/risk/${risk.id}/contingency/edit/${contingency.id}`);
  }

  function onHandleRedirect(contingency) {
    router.push(`/forrisco/risk/${risk.id}/contingency/${contingency.id}/info`);
  }

  function renderResponsible(contingency) {
    const { user } = contingency;
    return (
      <span>
        {user.name}
      </span>
    );
  }

  function renderManager(contingency) {
    const { manager } = contingency;
    return (
      <span>
        {getManagerDisplayName(manager)}
      </span>
    );
  }

  function renderTable() {
    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.contingencyDeleteConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteContingency(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const extractDate = dateTime => (dateTime ? dateTime.split(' ')[0] : '');

    const renderValidityCol = ({ validityBegin, validityEnd }) => {
      if (!validityBegin && !validityEnd) {
        return <span>Data não informada</span>;
      }

      return (
        <span style={{ display: 'flex', flexWrap: 'wrap' }}>
          {extractDate(validityBegin)}
          <span style={{ margin: '0 10px' }}>à</span>
          {extractDate(validityEnd)}
        </span>
      );
    };


    renderValidityCol.propTypes = {
      validityBegin: PropTypes.string.isRequired,
      validityEnd: PropTypes.string.isRequired,
    };

    function renderAction(contigency) {
      const { action } = contigency;
      return (
        <span>
          {cutPhrase(action, 35)}
        </span>
      );
    }

    const columns = [
      {
        name: Messages.get('label.action'),
        field: 'action',
        width: '30%',
        sort: true,
        render: renderAction,
      },
      {
        name: Messages.get('label.policyValidity'),
        field: 'validityBegin',
        width: '20%',
        render: renderValidityCol,
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
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editContingency'),
        action: onEdit,
        disabled: rowData => !isResponsibleForItemOrRiskOrHasPermission(
          rowData, risk, hasForriscoManageRiskItemsPermission,
        ),
      },
      {
        icon: 'trash',
        title: Messages.get('label.deleteContingency'),
        action: onHandleRenderDeleteModal,
        disabled: !isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission),
      },
    ];

    return (
      <Table
        data={contingencies}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onHandleRedirect}
      />
    );
  }

  return contingencies ? renderTable() : <LoadingGauge />;
};

ContingencyTable.propTypes = {
  contingencies: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
};

ContingencyTable.defaultProps = {
  contingencies: null,
  sortedBy: null,
};

ContingencyTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

export default ContingencyTable;
