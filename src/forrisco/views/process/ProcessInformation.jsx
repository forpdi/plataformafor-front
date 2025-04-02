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

const ProcessInformation = ({
  process,
  renderRelatedUnits,
}) => {
  function renderTopContent() {
    return (
      <TabbedPanel.TopContainer>
        <SecondaryTitle>{Messages.get('label.generalInfo')}</SecondaryTitle>
      </TabbedPanel.TopContainer>
    );
  }

  function renderMainContent() {
    const {
      id, name, relatedUnits, unitCreator, fileLink, file, allObjectives,
    } = process;
    const { name: fileName } = file || '';
    const { name: unitName } = unitCreator;

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
            href={`${FileStore.url}/${fileLink}`}
            style={{ wordBreak: 'break-all' }}
          />
        ) : (
          <InfoDisplay label={Messages.get('label.anex')} info={Messages.get('label.noRegister')} />
        )}
      </TabbedPanel.MainContainer>
    );
  }

  return (
    process ? (
      <div>
        {renderTopContent()}
        {renderMainContent()}
      </div>
    ) : <LoadingGauge />
  );
};

ProcessInformation.propTypes = {
  process: PropTypes.shape({}),
  renderRelatedUnits: PropTypes.func,
};

ProcessInformation.defaultProps = {
  process: null,
  renderRelatedUnits: null,
};

export default ProcessInformation;
