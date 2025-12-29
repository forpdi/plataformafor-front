import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';
import FileStore from 'forpdi/src/forpdi/core/store/File';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';

import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';
import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';

class ProcessInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'info', // padrão = Versão Atual
    };
  }

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

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderInfoContent() {
    const { process, renderRelatedUnits } = this.props;
    const {
      id, name, relatedUnits, unitCreator, fileLink, file, allObjectives,
    } = process;
    const { name: fileName } = file || {};
    const { name: unitName } = unitCreator || {};

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplay label={Messages.get('label.process.name')} info={name} />
        <InfoDisplayList
          label={Messages.get('label.objectives')}
          infoList={_.map(allObjectives, objective => objective.description)}
        />
        <InfoDisplay label={Messages.get('label.responsibleUnit')} info={unitName} />
        <InfoDisplayList
          label={Messages.get('label.relatedUnits')}
          infoList={relatedUnits}
          renderItem={renderRelatedUnits}
        />
        {(fileLink && fileName) ? (
          <InfoDisplayLink
            label={Messages.get('label.anex')}
            info={fileName}
            key={id}
            onClick={() => this.handleFileDownload(fileLink, fileName)}
            style={{ wordBreak: 'break-all', cursor: 'pointer' }}
          />
        ) : (
          <InfoDisplay label={Messages.get('label.anex')} info={Messages.get('label.noRegister')} />
        )}
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryContent() {
    const { process } = this.props;
    return (
      <TabbedPanel.MainContainer>
        <HistoryTable
          entityId={process.id}
          entityName="Process"
        />
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    const { process } = this.props;
    const { viewMode } = this.state;

    if (!process) return <LoadingGauge />;

    const title = viewMode === 'info'
      ? Messages.get('label.generalInfo')
      : `HISTÓRICO DE ALTERAÇÕES - ${String(process.name || '').toUpperCase()}`;

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SecondaryTitle>{title}</SecondaryTitle>

          <div style={{ marginLeft: 'auto' }}>
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

        {viewMode === 'info'
          ? this.renderInfoContent()
          : this.renderHistoryContent()}
      </div>
    );
  }
}

ProcessInformation.propTypes = {
  process: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    relatedUnits: PropTypes.arrayOf(PropTypes.any),
    unitCreator: PropTypes.shape({ name: PropTypes.string }),
    fileLink: PropTypes.string,
    file: PropTypes.shape({ name: PropTypes.string }),
    allObjectives: PropTypes.arrayOf(PropTypes.shape({ description: PropTypes.string })),
  }),
  renderRelatedUnits: PropTypes.func,
};

ProcessInformation.defaultProps = {
  process: null,
  renderRelatedUnits: null,
};

export default ProcessInformation;
