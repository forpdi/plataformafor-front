import React from 'react';
import PropTypes from 'prop-types';
import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';
import Modal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';

import Messages from 'forpdi/src/Messages';

import _ from 'underscore';

const MonitorRiskCards = ({
  monitoringData,
  hideEye,
},
{ router }) => {
  const onCardClick = (risks, label) => {
    const modal = (
      <DashboardItemsModal
        heading={label}
        subHeading={Messages.get('label.risks')}
        items={risks}
        getItemText={({ name }) => name}
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
  hideEye: PropTypes.bool,
};

MonitorRiskCards.defaultProps = {
  hideEye: false,
};

export default MonitorRiskCards;
