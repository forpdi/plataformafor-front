import React from 'react';
import PropTypes from 'prop-types';
import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';
import Modal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';

import Messages from 'forpdi/src/Messages';

import _ from 'underscore';
import resolveUnitInfo from 'forpdi/src/forrisco/utils/unitInfo';


const MonitorRiskCards = ({
  monitoringData,
  units,
  hideEye = false,
},
{ router } = {}) => {
  const onCardClick = (risks, label) => {
    const modal = (
      <DashboardItemsModal
        heading={label}
        subHeading={Messages.get('label.risks')}
        items={risks}
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
  };

  return (
    <ColorfulCard.GroupContainer>
      {
        _.map(monitoringData, ({
          quantity,
          percent,
          label,
          color,
          id,
          risks,
        }) => (
          <ColorfulCard
            color={color}
            key={id}
            onClick={() => onCardClick(risks, label)}
          >
            <ColorfulCard.MainContent>
              {quantity || '0'}
            </ColorfulCard.MainContent>
            <ColorfulCard.SecondaryLabel>{`(${percent}%)`}</ColorfulCard.SecondaryLabel>
            <ColorfulCard.SecondaryLabel>{label}</ColorfulCard.SecondaryLabel>
          </ColorfulCard>
        ))
      }
    </ColorfulCard.GroupContainer>
  );
};

MonitorRiskCards.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

MonitorRiskCards.propTypes = {
  monitoringData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  hideEye: PropTypes.bool,
};

export default MonitorRiskCards;
