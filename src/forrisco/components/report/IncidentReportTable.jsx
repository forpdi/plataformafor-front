import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Messages from 'forpdi/src/Messages';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';

/**
 * Colunas solicitadas:
 * i.   Unidade
 * ii.  Subunidade
 * iii. Risco
 * iv.  Código de identificação
 * v.   Tipo do risco
 * vi.  Incidente
 * vii. Ação corretiva
 * viii.Tipo do Incidente
 * ix.  Data (data e hora)
 */

const stripHtml = (html) => {
  if (!html) return '';
  return String(html)
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const IncidentReportTable = ({ incidents, loading, stickyTopHead }) => {
  const getUnitFromRow = row => (row && row.risk && row.risk.unit) || row.unit || null;

  const getUnitName = (row) => {
    const unit = getUnitFromRow(row);
    if (!unit) return '';
    return unit.parent ? unit.parent.name : (unit.name || '');
  };

  const getSubunitName = (row) => {
    const unit = getUnitFromRow(row);
    if (!unit) return '';
    return unit.parent ? (unit.name || '') : '';
  };

  const getRisk = row => (row && row.risk) || {};
  const getRiskName = row => getRisk(row).name || row.riskName || '';

  const getRiskCode = (row) => {
    const code = getRisk(row).code || row.riskCode || '';
    if (!code) return '';
    const str = String(code);
    return str.length > 32 ? `${str.slice(0, 32)}…` : str;
  };

  const getRiskType = row => getRisk(row).type || row.riskType || '';

  const getIncidentText = (row) => {
    const html = row.description || row.incident || row.title || '';
    return stripHtml(html);
  };

  const getCorrectiveAction = row => row.action || row.correctiveAction || row.actionPlan || '';

  const incidentTypeLabel = (value) => {
    const v = Number(value);
    if (v === 1) return 'Ameaça';
    if (v === 2) return 'Oportunidade';
    return '';
  };

  const getIncidentType = row => (
    <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
      {incidentTypeLabel(row.type)}
    </span>
  );

  const getDate = (row) => {
    const raw = row.date
      || row.creationDate
      || row.createdAt
      || row.begin
      || row.startedAt
      || row.created
      || null;

    if (!raw) return '';
    try {
      const parts = splitDateTime(raw);
      const date = parts && parts.date ? parts.date : '';
      const time = parts && parts.time ? parts.time : '';
      const both = [date, time].filter(Boolean).join(' ');
      return both || String(raw);
    } catch {
      return String(raw);
    }
  };

  const columns = [
    { name: Messages.get('label.unit'), render: getUnitName, width: '16%' },
    { name: Messages.get('label.subunit'), render: getSubunitName, width: '16%' },
    { name: Messages.get('label.risk'), render: getRiskName, width: '16%' },
    { name: Messages.get('label.code'), render: getRiskCode, width: '8%' },
    { name: Messages.get('label.riskType'), render: getRiskType, width: '12%' },
    { name: Messages.get('label.incident'), render: getIncidentText, width: '14%' },
    { name: Messages.get('label.correctionalActions'), render: getCorrectiveAction, width: '14%' },
    {
      name: Messages.get('label.incidentType'),
      render: getIncidentType,
      width: '12%',
      minWidth: '120px',
    },
    {
      name: Messages.get('label.dateTime'),
      render: getDate,
      width: '8%',
      minWidth: '120px',
    },
  ];

  if (loading) return <LoadingGauge />;

  return (
    <Table
      data={incidents || []}
      messageToEmptyData={
        !incidents
          ? 'Selecione uma política e um plano de gestão de risco para iniciar.'
          : undefined
      }
      columns={columns}
      stickyTopHead={stickyTopHead}
      style={{ tableLayout: 'auto', minWidth: '100%' }}
    />
  );
};

IncidentReportTable.propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.shape({})),
  loading: PropTypes.bool,
  stickyTopHead: PropTypes.number.isRequired,
};

IncidentReportTable.defaultProps = {
  incidents: null,
  loading: false,
};

export default IncidentReportTable;
