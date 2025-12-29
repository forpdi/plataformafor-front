import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Tag from 'forpdi/src/components/Tag';

import Messages from 'forpdi/src/Messages';
import FileStore from 'forpdi/src/forpdi/core/store/File';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';
import yesNoOptions from 'forpdi/src/enums/yesNoOptions';
import { constructFileLink } from 'forpdi/src/utils/util';

import PreventiveActionHistoryTable from 'forpdi/src/forrisco/views/risk/preventiveAction/PreventiveActionHistoryTable'; import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';


class PreventiveActionInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preventiveAction: null,
      viewMode: 'info',
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { actionId } = params;

    RiskStore.on(
      'findPreventiveAction',
      ({ data }) => {
        this.setState({ preventiveAction: data });
      },
      this,
    );

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_PREVENTIVE_ACTION,
      data: actionId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  handleFileDownload = (fileIdentifier, fileName) => {
    fetch(`${FileStore.url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: fileIdentifier }),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(new Error('Falha no download'));
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  };

  renderInfoView() {
    const { preventiveAction } = this.state;

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

    const { name: fileName, id: fileId } = file || {};
    const fileLink = fileId && fileName ? constructFileLink(fileId, fileName) : null;

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplay label={Messages.get('label.action')} info={action} />

        {validityBegin && validityEnd ? (
          <InfoDisplayDateRange
            label={Messages.get('label.policyValidity')}
            beginDate={validityBegin}
            endDate={validityEnd}
          />
        ) : (
          <InfoDisplay
            label={Messages.get('label.policyValidity')}
            info="Data não informada"
          />
        )}

        <InfoDisplay
          label={Messages.get('label.accomplished')}
          info={
            accomplished != null && yesNoOptions[accomplished]
              ? yesNoOptions[accomplished].label
              : '-'
          }
        />

        <InfoDisplay
          label={Messages.get('label.manager')}
          info={getManagerDisplayName(manager)}
        />

        <InfoDisplay
          label={Messages.get('label.responsible')}
          info={user && user.name ? user.name : '-'}
        />

        {fileLink && fileName ? (
          <InfoDisplayLink
            label={Messages.get('label.anex')}
            info={fileName}
            key={id}
            onClick={() => this.handleFileDownload(fileLink, fileName)}
            style={{ wordBreak: 'break-all', cursor: 'pointer' }}
          />
        ) : (
          <InfoDisplay
            label={Messages.get('label.anex')}
            info={Messages.get('label.noRegister')}
          />
        )}
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { preventiveAction } = this.state;
    return (
      <TabbedPanel.MainContainer>
        <PreventiveActionHistoryTable actionId={preventiveAction.id} />
      </TabbedPanel.MainContainer>
    );
  }

  renderTopContainer() {
    const { risk } = this.props;
    const { unit } = risk;
    const { viewMode, preventiveAction } = this.state;

    const title = viewMode === 'info'
      ? Messages.get('label.preventiveActions')
      : `HISTÓRICO DE ALTERAÇÕES - ${(preventiveAction?.action || '').toUpperCase()}`;

    return (
      <TabbedPanel.TopContainer>
        <SecondaryTitle title={title} style={{ maxWidth: '60%' }}>{title}</SecondaryTitle>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag label={getUnitTagLabel(unit)} />

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
    );
  }

  render() {
    const { preventiveAction, viewMode } = this.state;

    if (!preventiveAction) {
      return <LoadingGauge />;
    }

    return (
      <TabbedPanel tabs={[{ label: Messages.get('label.preventiveActions') }]}>
        {this.renderTopContainer()}
        {viewMode === 'info' ? this.renderInfoView() : this.renderHistoryView()}
      </TabbedPanel>
    );
  }
}

PreventiveActionInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

PreventiveActionInformation.propTypes = {
  risk: PropTypes.shape({
    unit: PropTypes.shape({}),
  }),
  params: PropTypes.shape({
    actionId: PropTypes.string,
  }).isRequired,
};

PreventiveActionInformation.defaultProps = {
  risk: null,
};

export default PreventiveActionInformation;
