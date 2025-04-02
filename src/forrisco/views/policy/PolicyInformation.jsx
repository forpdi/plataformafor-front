import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Text from 'forpdi/src/components/typography/Text';
import Tag from 'forpdi/src/components/Tag';
import InfoRiskMatrix from 'forpdi/src/forrisco/components/policy/InfoRiskMatrix';

import { getPolicyTagLabel, convertPIdescriptions } from 'forpdi/src/forrisco/helpers/policyHelper';
import Messages from 'forpdi/src/Messages';

const PolicyInformation = ({ policyData, riskLevels }) => {
  const render = () => {
    const renderListItem = item => (
      <div>
        <Text>
          <span style={{ fontWeight: 'bold' }}>{item.value}</span>
          <span style={{ margin: '0 5px' }}>-</span>
          {item.description}
        </Text>
      </div>
    );

    const {
      name,
      description,
      validityBegin,
      validityEnd,
      PIDescriptions,
      matrix,
    } = policyData;

    const { pdescriptions, idescriptions } = convertPIdescriptions(PIDescriptions);

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{name}</SecondaryTitle>
          <Tag label={getPolicyTagLabel(EnvInfo.company)} />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
          <InfoDisplayDateRange
            label={Messages.get('label.policyValidity')}
            beginDate={validityBegin}
            endDate={validityEnd}
          />
          <InfoRiskMatrix
            matrix={matrix}
            riskLevels={riskLevels}
          />
          <InfoDisplayList
            label={Messages.get('label.piDescription')}
            infoList={pdescriptions}
            renderItem={renderListItem}
          />
          <InfoDisplayList
            infoList={idescriptions}
            renderItem={renderListItem}
          />
        </TabbedPanel.MainContainer>
      </div>
    );
  };

  return render();
};

PolicyInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

PolicyInformation.propTypes = {
  policyData: PropTypes.shape({}),
  riskLevels: PropTypes.arrayOf(PropTypes.shape({})),
};

PolicyInformation.defaultProps = {
  policyData: null,
  riskLevels: null,
};

export default PolicyInformation;
