import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevel from 'forpdi/src/forrisco/enums/riskLevel';
import riskState from 'forpdi/src/forrisco/enums/riskState';
import CircleStatus from 'forpdi/src/forrisco/components/dashboard/CircleStatus';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';

const RiskReportTable = ({ risks, loading, stickyTopHead }, { router }) => {
  function onRedirect(risk) {
    const { id } = risk;
    router.push(`/forrisco/risk/${id}/details`);
  }

  function truncateText(text, maxLength) {
    const strText = String(text);
    if (strText.length <= maxLength) return strText;
    return `${strText.slice(0, maxLength)}...`;
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

    function renderLevels(risk) {
      const { level } = risk;
      if (level) {
        const riskLevels = riskLevel[level];
        return riskLevels.name;
      }

      return Messages.get('label.uninformed');
    }

    function renderTypology(risk) {
      const { tipology } = risk;
      if (!tipology) {
        return '';
      }

      const split = tipology.split(';');
      const firstTypology = split[0];
      return split.length > 0 ? `${firstTypology}...` : firstTypology;
    }

    function renderUnit(risk) {
      const { unit } = risk;
      if (unit.parent) {
        return unit.parent.name;
      }

      return unit.name;
    }

    function renderSubunit(risk) {
      const { unit } = risk;
      return unit.parent ? unit.name : '';
    }

    const columns = [
      {
        name: Messages.get('label.riskName'),
        field: 'name',
        width: '10%',
      },
      {
        name: Messages.get('label.code'),
        field: 'code',
        width: '5%',
        render: risk => truncateText(risk.code, 20),
      },
      {
        name: Messages.get('label.riskType'),
        field: 'type',
        width: '10%',
        minWidth: '130px',
      },
      {
        name: Messages.get('label.riskResponse'),
        render: renderResponse,
        width: '10%',
      },
      {
        name: Messages.get('label.typology'),
        render: renderTypology,
        width: '10%',
        minWidth: '130px',
      },
      {
        name: Messages.get('label.unit'),
        render: renderUnit,
        width: '20%',
      },
      {
        name: Messages.get('label.subunit'),
        render: renderSubunit,
        width: '20%',
      },
      {
        name: Messages.get('label.organizationalLevel'),
        render: renderLevels,
        width: '20%',
      },
      {
        name: Messages.get('label.creationDate'),
        render: ({ begin }) => splitDateTime(begin).date,
        width: '5%',
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

    return (
      <Table
        data={risks || []}
        messageToEmptyData={!risks ? 'Selecione uma política e um plano de gestão de risco para iniciar.' : undefined}
        columns={columns}
        stickyTopHead={stickyTopHead}
        redirect={onRedirect}
        style={{ tableLayout: 'auto', minWidth: '100%' }}
      />
    );
  }

  return loading ? <LoadingGauge /> : renderTable();
};

RiskReportTable.propTypes = {
  risks: PropTypes.arrayOf(PropTypes.shape({})),
  loading: PropTypes.bool,
  stickyTopHead: PropTypes.number.isRequired,
};

RiskReportTable.defaultProps = {
  risks: null,
  loading: false,
};

RiskReportTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

export default RiskReportTable;
