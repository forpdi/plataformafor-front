import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';

import Messages from 'forpdi/src/Messages';

const UnitInformation = ({ unitData }, { router, hasForriscoEditUnitPermission }) => {
  const onEdit = () => {
    const { id } = unitData;
    router.push(`/forrisco/unit/edit/${id}`);
  };

  const render = () => {
    if (!unitData) {
      return (
        <LoadingGauge />
      );
    }

    const {
      user,
      planRisk,
      abbreviation,
      description,
    } = unitData;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.generalInfo')}</SecondaryTitle>
          {
            (hasForriscoEditUnitPermission || isResponsible(unitData)) && (
              <IconButton
                icon="pen"
                title={Messages.get('label.editUnit')}
                onClick={onEdit}
              />
            )
          }
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
          <InfoDisplay label={Messages.get('label.abbreviation')} info={abbreviation} />
          <InfoDisplay label={Messages.get('label.linkedPlanRisk')} info={planRisk.name} />
          <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
        </TabbedPanel.MainContainer>
      </div>
    );
  };

  return render();
};

UnitInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoEditUnitPermission: PropTypes.bool.isRequired,
};

UnitInformation.propTypes = {
  unitData: PropTypes.shape({}),
};

UnitInformation.defaultProps = {
  unitData: null,
};

export default UnitInformation;
