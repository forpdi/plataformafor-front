import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';

import Messages from 'forpdi/src/Messages';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

const PlanRiskInformation = ({ planRiskData }, { router, hasForriscoManagePlanRiskPermission }) => {
  const onEdit = () => {
    const { id } = planRiskData;
    router.push(`/forrisco/plan-risk/edit/${id}`);
  };

  const render = () => {
    if (!planRiskData) {
      return <LoadingGauge />;
    }

    const {
      description, policy, validityBegin, validityEnd,
    } = planRiskData;
    const { name } = policy;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.generalInfo')}</SecondaryTitle>
          {
            hasForriscoManagePlanRiskPermission && (
              <IconButton
                icon="pen"
                title={Messages.get('label.editPlan')}
                onClick={onEdit}
              />
            )
          }
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <InfoDisplayDateRange
            label={Messages.get('label.policyValidity')}
            beginDate={validityBegin}
            endDate={validityEnd}
          />
          <InfoDisplay label={Messages.get('label.linkedPolicy')} info={name} />
          <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
        </TabbedPanel.MainContainer>
      </div>
    );
  };

  return render();
};

PlanRiskInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskInformation.propTypes = {
  planRiskData: PropTypes.shape({}),
};

PlanRiskInformation.defaultProps = {
  planRiskData: null,
};

export default PlanRiskInformation;
