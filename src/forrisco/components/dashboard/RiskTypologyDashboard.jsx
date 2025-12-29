import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';
import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';

import Messages from 'forpdi/src/Messages';
import { getTipologyData } from 'forpdi/src/forrisco/helpers/dashboard/riskTypologyDashboardHelper';
import resolveUnitInfo from 'forpdi/src/forrisco/utils/unitInfo';


const RiskTypologyDashboard = ({
  risks = null,
  riskTypes,
  riskIds = [-1],
  unitIds,
  units,
  hideEye = false,
  strategyId = -1,
}, { router } = {}) => {
  const typologyData = getTipologyData(risks, riskTypes, riskIds, unitIds, strategyId);

  function onCardClick(items, label) {
    const modal = (
      <DashboardItemsModal
        heading={label}
        subHeading={Messages.get('label.risks')}
        items={items}
        getItemText={(item) => {
          const unitInfo = resolveUnitInfo(units, item);
          const hasName = unitInfo && unitInfo.name;
          const unitLabel = hasName
            ? `${unitInfo.abbreviation ? `${unitInfo.abbreviation} - ` : ''}${unitInfo.name}`
            : '';
          return (
            <div>
              <div>{item.name}</div>
              {hasName && (
                <div style={{ marginLeft: 20, color: 'rgba(0,0,0,0.6)', fontSize: 11 }}>
                  {unitLabel}
                </div>
              )}
            </div>
          );
        }}
        onClick={({ id }) => router.push(`/forrisco/risk/${id}/details/info`)}
        hideEye={hideEye}
      />
    );

    Modal.show(modal);
  }

  return (
    <ColorfulCard.GroupContainer>
      {
        _.map(typologyData, ({
          color,
          label,
          quantity,
          risks: filteredRisks,
        }) => {
          const labelWithSpaces = label.replace('/', ' / ');
          return (
            <ColorfulCard
              color={color}
              key={label}
              width="10rem"
              onClick={() => onCardClick(filteredRisks, label)}
            >
              <ColorfulCard.MainContent>
                {quantity || '0'}
              </ColorfulCard.MainContent>
              <ColorfulCard.SecondaryLabel>{labelWithSpaces}</ColorfulCard.SecondaryLabel>
            </ColorfulCard>
          );
        })
      }
    </ColorfulCard.GroupContainer>
  );
};

RiskTypologyDashboard.propTypes = {
  risks: PropTypes.arrayOf(PropTypes.shape({})),
  riskTypes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number),
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  strategyId: PropTypes.number,
  hideEye: PropTypes.bool,
};

RiskTypologyDashboard.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default RiskTypologyDashboard;
