import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import Messages from 'forpdi/src/Messages';

import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class UnitInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'info',
    };
  }

  onEdit = () => {
    const { unitData } = this.props;
    const { router } = this.context;
    const { id } = unitData;
    router.push(`/forrisco/unit/edit/${id}`);
  };

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderInfoView() {
    const { unitData } = this.props;
    const {
      user,
      planRisk,
      abbreviation,
      description,
    } = unitData;

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
        <InfoDisplay label={Messages.get('label.abbreviation')} info={abbreviation} />
        <InfoDisplay label={Messages.get('label.linkedPlanRisk')} info={planRisk.name} />
        <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { unitData } = this.props;
    return (
      <TabbedPanel.MainContainer>
        <HistoryTable
          entityId={unitData.id}
          entityName="Unit"
        />
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    const { unitData } = this.props;
    const { hasForriscoEditUnitPermission } = this.context;
    const { viewMode } = this.state;

    if (!unitData) {
      return <LoadingGauge />;
    }

    const title = viewMode === 'info'
      ? Messages.get('label.generalInfo')
      : `HISTÓRICO DE ALTERAÇÕES - ${unitData.name.toUpperCase()}`;

    const canEdit = viewMode === 'info' && (isResponsible(unitData) || hasForriscoEditUnitPermission);

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SecondaryTitle>{title}</SecondaryTitle>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {canEdit && (
              <IconButton
                icon="pen"
                title={Messages.get('label.editUnit')}
                onClick={this.onEdit}
              />
            )}
            <SegmentedSwitch
              options={[
                { id: 'info', label: 'Versão Atual' },
                { id: 'history', label: 'Histórico' },
              ]}
              value={viewMode}
              onChange={this.onViewModeChange}
              minWidth={120}
              ariaLabel="Alternar entre Versão Atual e Histórico"
            />

          </div>
        </TabbedPanel.TopContainer>

        {viewMode === 'info' ? this.renderInfoView() : this.renderHistoryView()}
      </div>
    );
  }
}

UnitInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoEditUnitPermission: PropTypes.bool.isRequired,
};

UnitInformation.propTypes = {
  unitData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    user: PropTypes.shape({ name: PropTypes.string }),
    abbreviation: PropTypes.string,
    planRisk: PropTypes.shape({ name: PropTypes.string }),
    description: PropTypes.string,
  }),
};

UnitInformation.defaultProps = {
  unitData: null,
};

export default UnitInformation;
