import PropTypes from 'prop-types';
import React from 'react';

import InfoRiskMatrix from 'forpdi/src/forrisco/components/policy/InfoRiskMatrix';
import Modal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';

import Messages from 'forpdi/src/Messages';
import { getCountMatrix } from 'forpdi/src/forrisco/helpers/dashboard/riskMatrixDashboardHelper';
import { getRisksByTypesAndUnit } from 'forpdi/src/forrisco/helpers/riskHelper';
import { matrixStringToProbabilityImpactRiskLevel } from 'forpdi/src/forrisco/helpers/policyHelper';

const RiskMatrixDashboard = ({
  risks,
  policy,
  riskLevels,
  riskTypes,
  riskIds,
  unitIds,
  hideEye,
  strategyId,
}, { router }) => {
  const filteredRisks = getRisksByTypesAndUnit(risks, riskTypes, riskIds, unitIds, strategyId);
  const { matrix } = policy;

  const countMatrix = calculateMatrixCount();

  function calculateMatrixCount() {
    const { probabilities, impacts } = matrixStringToProbabilityImpactRiskLevel(matrix);
    return getCountMatrix(probabilities, impacts, filteredRisks);
  }

  function onCellClick(cell, rowIndex, colIndex) {
    const { risks: cellRisks } = countMatrix[rowIndex][colIndex];
    const { riskLevel, probability, impact } = cell;

    const modal = (
      <DashboardItemsModal
        heading={riskLevel}
        headingDetails={[
          { label: 'Tipo', value: riskTypes[0].label },
          { label: 'Probabilidade', value: probability },
          { label: 'Impacto', value: impact },
        ]}
        subHeading={Messages.get('label.risks')}
        items={cellRisks}
        getItemText={({ name }) => name}
        onClick={({ id }) => router.push(`/forrisco/risk/${id}/details/info`)}
        hideEye={hideEye}
      />
    );

    Modal.show(modal);
  }

  function getRiskLabel(cell, rowIndex, colIndex) {
    const { count } = countMatrix[rowIndex][colIndex];
    return count;
  }

  return (
    <InfoRiskMatrix
      matrix={matrix}
      riskLevels={riskLevels}
      getRiskLabel={getRiskLabel}
      onClick={onCellClick}
    />
  );
};

RiskMatrixDashboard.propTypes = {
  risks: PropTypes.arrayOf(PropTypes.shape({})),
  policy: PropTypes.shape({}).isRequired,
  riskLevels: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskTypes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number),
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  strategyId: PropTypes.number,
  hideEye: PropTypes.bool,
};

RiskMatrixDashboard.defaultProps = {
  risks: null,
  hideEye: false,
  riskIds: [-1],
  strategyId: -1,
};

RiskMatrixDashboard.contextTypes = {
  router: PropTypes.shape({}),
};

export default RiskMatrixDashboard;
