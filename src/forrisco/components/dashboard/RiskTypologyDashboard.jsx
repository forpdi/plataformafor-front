import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';
import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';

import Messages from 'forpdi/src/Messages';
import { getTipologyData } from 'forpdi/src/forrisco/helpers/dashboard/riskTypologyDashboardHelper';

const RiskTypologyDashboard = ({
  risks,
  riskTypes,
  riskIds,
  unitIds,
  hideEye,
  strategyId,
}, { router }) => {
  const typologyData = getTipologyData(risks, riskTypes, riskIds, unitIds, strategyId);

  function onCardClick(items, label) {
    const modal = (
      <DashboardItemsModal
        heading={label}
        subHeading={Messages.get('label.risks')}
        items={items}
        getItemText={({ name }) => name}
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
  strategyId: PropTypes.number,
  hideEye: PropTypes.bool,
};

RiskTypologyDashboard.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

RiskTypologyDashboard.defaultProps = {
  risks: null,
  riskIds: [-1],
  hideEye: false,
  strategyId: -1,
};

export default RiskTypologyDashboard;
