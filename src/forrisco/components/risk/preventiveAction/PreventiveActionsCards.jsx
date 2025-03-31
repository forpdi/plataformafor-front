import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';
import Modal from 'forpdi/src/components/modals/Modal';
import PreventiveActionsModal from 'forpdi/src/components/dashboard/PreventiveActionsModal';

import { getMappedPreventiveAction } from 'forpdi/src/forrisco/helpers/dashboard/preventiveActionDashboardHelper';

const PreventiveActionsCards = ({
  preventiveActionsData,
  hideEye,
},
{ router }) => {
  const onCardClick = (actions, label) => {
    const mappedPreventiveAction = getMappedPreventiveAction(actions, ({ riskName }) => riskName);

    const modal = (
      <PreventiveActionsModal
        heading={label}
        preventiveActionsData={mappedPreventiveAction}
        onClick={({ id, riskId }) => router.push(`/forrisco/risk/${riskId}/preventiveAction/${id}/info`)}
        hideEye={hideEye}
      />
    );

    Modal.show(modal);
  };

  return (
    <ColorfulCard.GroupContainer>
      {
        _.map(preventiveActionsData, ({
          quantity,
          percent,
          label,
          color,
          id,
          actions,
        }) => (
          <ColorfulCard
            color={color}
            key={id}
            onClick={() => onCardClick(actions, label)}
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

PreventiveActionsCards.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

PreventiveActionsCards.propTypes = {
  preventiveActionsData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  hideEye: PropTypes.bool,
};

PreventiveActionsCards.defaultProps = {
  hideEye: false,
};

export default PreventiveActionsCards;
