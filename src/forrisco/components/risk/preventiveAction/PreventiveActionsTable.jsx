import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import { getManagerDisplayName, isResponsibleForItemOrRiskOrHasPermission } from 'forpdi/src/forrisco/helpers/riskHelper';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import yesNoOptions from 'forpdi/src/enums/yesNoOptions';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

const PreventiveActionsTable = (
  {
    preventiveActions,
    onSort,
    sortedBy,
    risk,
  },
  { router, hasForriscoManageRiskItemsPermission },
) => {
  function deletePreventiveAction(rowData) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE_PREVENTIVE_ACTION,
      data: { actionId: rowData.id },
    });
  }

  function onRedirect(rowData) {
    const { id: preventiveActionId } = rowData;
    const { id: riskId } = risk;
    router.push(`/forrisco/risk/${riskId}/preventiveAction/${preventiveActionId}/info`);
  }

  function renderTable() {
    const renderResponsible = (preventiveAction) => {
      const { user } = preventiveAction;
      return <span>{user.name}</span>;
    };

    const renderManager = (preventiveAction) => {
      const { manager } = preventiveAction;
      return <span>{getManagerDisplayName(manager)}</span>;
    };

    function renderAction(preventiveAction) {
      const { action } = preventiveAction;
      return (
        <span>
          {cutPhrase(action, 35)}
        </span>
      );
    }


    const renderAccomplished = (preventiveAction) => {
      const { accomplished } = preventiveAction;
      return yesNoOptions[accomplished].label;
    };

    const onEdit = (preventiveAction) => {
      router.push(`/forrisco/risk/${risk.id}/preventiveActions/edit/${preventiveAction.id}`);
    };

    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.preventiveActionDeleteConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deletePreventiveAction(data)}
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

    // const sortResponsible = data => _.sortBy(data, elem => elem.user.name);

    // const sortManager = data => _.sortBy(data, elem => elem.manager.name);

    // const sortAccomplished = data => _.sortBy(data, elem => elem.accomplished);

    // const sortValidity = data => _.sortBy(data, (elem) => {
    //   const { date } = splitDateTime(elem.validityBegin);
    //   return parseDate(date);
    // });

    const columns = [
      {
        name: Messages.get('label.action'),
        field: 'action',
        width: '30%',
        render: renderAction,
        sort: true,
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
        render: renderResponsible,
        field: 'user.name',
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.manager'),
        render: renderManager,
        field: 'manager.name',
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.accomplished'),
        field: 'accomplished',
        render: renderAccomplished,
        width: '20%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.preventiveActionEdit'),
        action: onEdit,
        disabled: rowData => !isResponsibleForItemOrRiskOrHasPermission(
          rowData, risk, hasForriscoManageRiskItemsPermission,
        ),
      },
      {
        icon: 'trash',
        title: Messages.get('label.preventiveActionDelete'),
        action: onHandleRenderDeleteModal,
        disabled: !isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission),
      },
    ];

    return (
      <Table
        data={preventiveActions}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
      />
    );
  }

  return preventiveActions ? renderTable() : <LoadingGauge />;
};

PreventiveActionsTable.propTypes = {
  preventiveActions: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
};

PreventiveActionsTable.defaultProps = {
  preventiveActions: null,
  sortedBy: [],
};

PreventiveActionsTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

export default PreventiveActionsTable;
