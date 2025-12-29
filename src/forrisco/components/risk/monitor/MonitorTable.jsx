import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import Text from 'forpdi/src/components/typography/Text';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

import { htmlStringToSimpleText } from 'forpdi/src/utils/util';
import {
  getManagerDisplayName, isResponsibleForItemOrRiskOrHasPermission, getClassificationNameFromPolicy, getDynamicColorForClassification,
} from 'forpdi/src/forrisco/helpers/riskHelper';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const MonitorTable = (
  {
    monitores,
    onSort,
    sortedBy,
    risk,
    policy,
    riskLevels,
  },
  { router, hasForriscoManageRiskItemsPermission },
) => {
  function deleteMonitor(monitor) {
    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE_MONITOR,
      data: {
        monitorId: monitor.id,
      },
    });
  }

  function onEdit(monitor) {
    router.push(`/forrisco/risk/${risk.id}/monitors/edit/${monitor.id}`);
  }

  function onHandleRedirect(monitor) {
    router.push(`/forrisco/risk/${risk.id}/monitors/${monitor.id}/info`);
  }

  function renderResponsible(monitor) {
    const { user } = monitor;
    return (
      <span>
        {user.name}
      </span>
    );
  }

  function renderRiskClassificationCard(monitor) {
    if (!monitor || !policy || !riskLevels) return null;

    const { probability, impact } = monitor;
    if (probability == null || impact == null) return null;

    const classificationName = getClassificationNameFromPolicy(policy, probability, impact);
    if (!classificationName) return null;

    const classificationColor = getDynamicColorForClassification(classificationName, riskLevels);
    if (!classificationColor) return null;

    const textColorClassName = classificationColor ? 'frisco-secondary-color' : '';

    return (
      <div
        className="info-risk-matrix__cell"
        style={{
          backgroundColor: classificationColor,
          width: '80%',
          textAlign: 'center',
          padding: '5px 0',
          borderRadius: '4px',
          marginTop: 8,
        }}
      >
        <Text
          title={classificationName}
          className={`info-risk-matrix__cell-text ${textColorClassName}`}
          text={classificationName}
        />
      </div>
    );
  }


  function renderManager(monitor) {
    const { manager } = monitor;
    return (
      <span>
        {getManagerDisplayName(manager)}
      </span>
    );
  }

  function renderTable() {
    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.monitoringDeleteConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteMonitor(data)}
        />
      );
      Modal.show(confirmModal);
    };

    function renderReport(monitor) {
      const { report } = monitor;
      const text = htmlStringToSimpleText(report);
      return (
        <span>
          {cutPhrase(text, 35)}
        </span>
      );
    }


    const columns = [
      {
        name: Messages.get('label.report'),
        field: 'report',
        width: '15%',
        sort: true,
        render: renderReport,
      },
      {
        name: Messages.get('label.probability'),
        field: 'probability',
        width: '15%',
        sort: true,
      },
      {
        name: Messages.get('label.impact'),
        field: 'impact',
        width: '15%',
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
        width: '15%',
        sort: true,
      },
      {
        name: Messages.get('label.policyLevelOne'),
        field: 'riskLevel',
        sort: true,
        render: renderRiskClassificationCard,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editMonitoring'),
        action: onEdit,
        disabled: rowData => !isResponsibleForItemOrRiskOrHasPermission(
          rowData, risk, hasForriscoManageRiskItemsPermission,
        ),
      },
      {
        icon: 'trash',
        title: Messages.get('label.deleteMonitoring'),
        action: onHandleRenderDeleteModal,
        disabled: !isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission),
      },
    ];

    return (
      <Table
        data={monitores}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onHandleRedirect}
      />
    );
  }

  return monitores ? renderTable() : <LoadingGauge />;
};

MonitorTable.propTypes = {
  monitores: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  risk: PropTypes.shape({}).isRequired,
  policy: PropTypes.shape({}),
  riskLevels: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

MonitorTable.defaultProps = {
  monitores: null,
  sortedBy: null,
  policy: null,
  riskLevels: null,
};

MonitorTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};

export default MonitorTable;
