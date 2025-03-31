import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import Tag from 'forpdi/src/components/Tag';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayListWithActionButton from 'forpdi/src/components/info/InfoDisplayListWithActionButton';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';

import { getDateTimeWithoutSeconds } from 'forpdi/src/utils/dateUtil';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import {
  getUpdatedLinkFpdi,
  typologyStringToFullList,
  getManagerDisplayName,
  shouldDisplayUnitsToShare,
} from 'forpdi/src/forrisco/helpers/riskHelper';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevelEnum from 'forpdi/src/forrisco/enums/riskLevel';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';
import Messages from 'forpdi/src/Messages';

const RiskInformation = ({ risk }, { router }) => {
  function renderTopContainer() {
    const { unit } = risk;

    return (
      <TabbedPanel.TopContainer>
        <SecondaryTitle>{Messages.get('label.risk')}</SecondaryTitle>
        <Tag
          label={getUnitTagLabel(unit)}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={handleUnitClick}
        />
      </TabbedPanel.TopContainer>
    );
  }

  function handleUnitClick() {
    const { unit } = risk;
    if (unit && unit.id) {
      router.push(`forrisco/unit/${unit.id}/info`);
    }
  }

  function onListItemClick(item) {
    const link = getUpdatedLinkFpdi(item);
    link && router.push(link);
  }

  function renderMainContainer() {
    if (!risk) {
      return <LoadingGauge />;
    }

    const {
      name,
      begin,
      code,
      user,
      manager,
      reason,
      probability,
      impact,
      periodicity,
      type,
      tipology,
      otherTipologies,
      strategies,
      axes,
      indicators,
      goals,
      activities,
      result,
      response,
      sharedUnits,
      level,
      processObjectives,
      archived,
    } = risk;

    const responseName = response ? riskResponseEnum[response].name : Messages.get('label.uninformed');
    const levelName = level ? riskLevelEnum[level].name : Messages.get('label.uninformed');

    return (
      <TabbedPanel.MainContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.risk.name')} info={name} />
          </div>
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.riskDateHourCreation')}
              info={getDateTimeWithoutSeconds(begin)}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.risk.id')} info={code} />
          </div>
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.stateOfRisk')}
              info={riskArchivedStatus[archived].name}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
          </div>
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.responsible')} info={user && user.name} />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6" style={{ overflowWrap: 'break-word' }}>
            <InfoDisplayHtml label={Messages.get('label.causes')} htmlInfo={reason} />
          </div>
          <div className="col-sm-6" style={{ overflowWrap: 'break-word' }}>
            <InfoDisplayHtml label={Messages.get('label.consequences')} htmlInfo={result} />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.probability')} info={probability} />
          </div>
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.impact')} info={impact} />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.monitoringPeriod')} info={periodicity} />
          </div>
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.typeLegend')} info={type} />
          </div>
        </InputContainer>

        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.riskResponse')} info={responseName} />
          </div>
          <div className="col-sm-6">
            {
              shouldDisplayUnitsToShare(response) && (
                <InfoDisplayList
                  label={Messages.get('label.unitSubunit')}
                  infoList={_.map(sharedUnits, unit => unit.name)}
                  maxHeight="100px"
                />
              )
            }
          </div>
        </InputContainer>

        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay label={Messages.get('label.organizationalLevel')} info={levelName} />
          </div>
        </InputContainer>

        <InfoDisplayList
          label={Messages.get('label.typology')}
          infoList={typologyStringToFullList(tipology, otherTipologies)}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedProcessActivities')}
          infoList={activities.list}
          emptyMessage={Messages.get('label.noneProcessActivitiesLinked')}
          onClick={onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedProcessObjectives')}
          infoList={processObjectives}
          emptyMessage={Messages.get('label.noneProcessObjectivesLinked')}
          getItemText={({ processObjective }) => processObjective.description}
          onClick={onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedThematicAxes')}
          infoList={axes.list}
          emptyMessage={Messages.get('label.noneThematicAxesLinked')}
          onClick={onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedStrategicObjectives')}
          infoList={strategies.list}
          emptyMessage={Messages.get('label.noneStrategicObjectivesLinked')}
          onClick={onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedIndicators')}
          infoList={indicators.list}
          emptyMessage={Messages.get('label.noneIndicatorLinked')}
          onClick={onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedGoals')}
          infoList={goals.list}
          emptyMessage={Messages.get('label.noneGoalLinked')}
          onClick={onListItemClick}
        />
      </TabbedPanel.MainContainer>
    );
  }

  return (
    <div>
      {renderTopContainer()}
      {renderMainContainer()}
    </div>
  );
};

RiskInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

RiskInformation.propTypes = {
  risk: PropTypes.shape({}),
};

RiskInformation.defaultProps = {
  risk: null,
};

export default RiskInformation;
