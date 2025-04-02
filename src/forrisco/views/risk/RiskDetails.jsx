import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';

const RiskDetails = ({
  children,
  risk,
}) => {
  const { id: riskId } = risk;
  return (
    <AppContainer.MainContent>
      <TabbedPanel
        tabs={[
          { label: Messages.get('label.generalInfo'), to: `/forrisco/risk/${riskId}/details/info` },
          { label: Messages.get('label.preventiveActions'), to: `/forrisco/risk/${riskId}/details/preventiveActions` },
          { label: Messages.get('label.monitoring'), to: `/forrisco/risk/${riskId}/details/monitors` },
          { label: Messages.get('label.incidents'), to: `/forrisco/risk/${riskId}/details/incidents` },
          { label: Messages.get('label.contingency'), to: `/forrisco/risk/${riskId}/details/contingency` },
        ]}
      >
        {React.cloneElement(children, { risk })}
      </TabbedPanel>
    </AppContainer.MainContent>
  );
};

RiskDetails.propTypes = {
  risk: PropTypes.shape({}),
  children: PropTypes.node,
};

RiskDetails.defaultProps = {
  children: null,
  risk: null,
};

export default RiskDetails;
