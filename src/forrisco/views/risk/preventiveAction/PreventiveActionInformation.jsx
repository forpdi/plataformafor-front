import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Tag from 'forpdi/src/components/Tag';

import Messages from 'forpdi/src/Messages';
import FileStore from 'forpdi/src/forpdi/core/store/File';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';
import yesNoOptions from 'forpdi/src/enums/yesNoOptions';
import { constructFileLink } from 'forpdi/src/utils/util';

class PreventiveActionInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preventiveAction: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { actionId } = params;

    RiskStore.on('findPreventiveAction', ({ data }) => {
      this.setState({ preventiveAction: data });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_PREVENTIVE_ACTION,
      data: actionId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  renderTopContainer() {
    const { risk } = this.props;
    const { unit } = risk;

    return (
      <TabbedPanel.TopContainer>
        <SecondaryTitle>{Messages.get('label.preventiveActions')}</SecondaryTitle>
        <Tag label={getUnitTagLabel(unit)} />
      </TabbedPanel.TopContainer>
    );
  }

  renderMainContainer() {
    const { preventiveAction } = this.state;

    if (!preventiveAction) {
      return <LoadingGauge />;
    }

    const {
      id,
      action,
      validityBegin,
      validityEnd,
      accomplished,
      user,
      manager,
      file,
    } = preventiveAction;
    const { name: fileName, id: fileId } = file || '';
    const fileLink = constructFileLink(fileId, fileName);

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplay label={Messages.get('label.action')} info={action} />
        {validityBegin && validityEnd ? (
          <InfoDisplayDateRange
            label={Messages.get('label.policyValidity')}
            beginDate={validityBegin}
            endDate={validityEnd}
          />
        )
          : <InfoDisplay label={Messages.get('label.policyValidity')} info="Data não informada" />
        }
        <InfoDisplay label={Messages.get('label.accomplished')} info={yesNoOptions[accomplished].label} />
        <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
        <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
        {(fileLink && fileName) ? (
          <InfoDisplayLink
            label={Messages.get('label.anex')}
            info={fileName}
            key={id}
            href={`${FileStore.url}/${fileLink}`}
            style={{ wordBreak: 'break-all' }}
          />
        ) : (
          <InfoDisplay label={Messages.get('label.anex')} info={Messages.get('label.noRegister')} />
        )}
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    return (
      <TabbedPanel tabs={[{ label: Messages.get('label.preventiveActions') }]}>
        {this.renderTopContainer()}
        {this.renderMainContainer()}
      </TabbedPanel>
    );
  }
}

PreventiveActionInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

PreventiveActionInformation.propTypes = {
  risk: PropTypes.shape({}),
  params: PropTypes.shape({
    actionId: PropTypes.string,
  }).isRequired,
};

PreventiveActionInformation.defaultProps = {
  risk: null,
};

export default PreventiveActionInformation;
