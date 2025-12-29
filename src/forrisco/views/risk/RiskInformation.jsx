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
import Text from 'forpdi/src/components/typography/Text';
import { getDateTimeWithoutSeconds } from 'forpdi/src/utils/dateUtil';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import {
  getUpdatedLinkFpdi,
  typologyStringToFullList,
  getManagerDisplayName,
  shouldDisplayUnitsToShare,
  getColorHexById,
} from 'forpdi/src/forrisco/helpers/riskHelper';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevelEnum from 'forpdi/src/forrisco/enums/riskLevel';
import riskStatusOptions from 'forpdi/src/forrisco/enums/riskStatusOptions';
import Messages from 'forpdi/src/Messages';
import { EXISTENT_CONTROLLERS_OPTIONS, EXECUTION_CONTROLLERS_OPTIONS } from 'forpdi/src/forrisco/enums/riskControllersEnum';

import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

const STATUS_BY_ID = Array.isArray(riskStatusOptions.list)
  ? riskStatusOptions.list.reduce((acc, opt) => {
    acc[opt.id] = opt;
    return acc;
  }, {})
  : {};

class RiskInformation extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { viewMode: 'info' };
  }

  handleUnitClick = () => {
    const { risk } = this.props;
    const { router } = this.context;
    if (risk?.unit?.id) {
      router.push(`forrisco/unit/${risk.unit.id}/info`);
    }
  };

  getControllerLabel(options, id) {
    if (!id) return Messages.get('label.uninformed');
    const foundOption = _.find(options, option => option.id === id);
    return foundOption ? foundOption.label : Messages.get('label.uninformed');
  }

  onListItemClick = (item) => {
    const { router } = this.context;
    const link = getUpdatedLinkFpdi(item);
    if (link) router.push(link);
  };

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderRiskClassificationCard() {
    const { risk } = this.props;
    if (!risk) return null;

    const { riskLevel, probability, impact } = risk || {};

    const hasValue = v => v !== null && v !== undefined && String(v).trim() !== '';
    const hasProb = hasValue(probability);
    const hasImpact = hasValue(impact);

    if (!hasProb || !hasImpact) return null;
    if (!riskLevel) return null;

    const classificationName = riskLevel.level;
    const classificationColor = getColorHexById(riskLevel.color);

    if (!classificationName || !classificationColor) return null;

    const textColorClassName = classificationColor ? 'frisco-secondary-color' : '';

    return (
      <div
        className="info-risk-matrix__cell"
        style={{
          backgroundColor: classificationColor,
          width: '20%',
          textAlign: 'center',
          padding: '5px 0',
          borderRadius: '4px',
        }}
      >
        <Text
          title={classificationName}
          className={`info-risk-matrix__cell-text ${textColorClassName}`}
          text={classificationName}
        />
      </div>
    );
  }

  renderInfoView() {
    const { risk } = this.props;
    if (!risk) return <LoadingGauge />;

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
      imported,
      executionControllerId,
      existentControllerId,
    } = risk;

    const responseName = response ? riskResponseEnum[response].name : Messages.get('label.uninformed');
    const levelName = level ? riskLevelEnum[level].name : Messages.get('label.uninformed');

    const existentControllerLabel = this.getControllerLabel(EXISTENT_CONTROLLERS_OPTIONS, existentControllerId);
    const executionControllerLabel = this.getControllerLabel(EXECUTION_CONTROLLERS_OPTIONS, executionControllerId);

    let statusMeta = {};

    if (imported) {
      statusMeta = STATUS_BY_ID.imported || {};
    } else if (archived) {
      statusMeta = STATUS_BY_ID.archived || {};
    } else {
      statusMeta = STATUS_BY_ID.published || {};
    }

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
              info={statusMeta.name || Messages.get('label.stateOfRiskPublished')}
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
            <InfoDisplay label={Messages.get('label.existentControllers')} info={existentControllerLabel} />
          </div>
          {existentControllerId && (
            <div className="col-sm-6">
              <InfoDisplay label={Messages.get('label.executionControllers')} info={executionControllerLabel} />
            </div>
          )}
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
            {this.renderRiskClassificationCard()}
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
            {shouldDisplayUnitsToShare(response) && (
              <InfoDisplayList
                label={Messages.get('label.unitSubunit')}
                infoList={_.map(sharedUnits, unit => unit.name)}
                maxHeight="100px"
              />
            )}
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
          onClick={this.onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedProcessObjectives')}
          infoList={processObjectives}
          emptyMessage={Messages.get('label.noneProcessObjectivesLinked')}
          getItemText={({ processObjective }) => processObjective.description}
          onClick={this.onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedThematicAxes')}
          infoList={axes.list}
          emptyMessage={Messages.get('label.noneThematicAxesLinked')}
          onClick={this.onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedStrategicObjectives')}
          infoList={strategies.list}
          emptyMessage={Messages.get('label.noneStrategicObjectivesLinked')}
          onClick={this.onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedIndicators')}
          infoList={indicators.list}
          emptyMessage={Messages.get('label.noneIndicatorLinked')}
          onClick={this.onListItemClick}
        />

        <InfoDisplayListWithActionButton
          label={Messages.get('label.linkedGoals')}
          infoList={goals.list}
          emptyMessage={Messages.get('label.noneGoalLinked')}
          onClick={this.onListItemClick}
        />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { risk } = this.props;
    return (
      <TabbedPanel.MainContainer>
        <HistoryTable entityId={risk.id} entityName="Risk" />
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    const { risk } = this.props;
    const { viewMode } = this.state;
    if (!risk) return <LoadingGauge />;

    const title = viewMode === 'info'
      ? Messages.get('label.risk')
      : `HISTÓRICO DE ALTERAÇÕES - ${risk.name?.toUpperCase?.()}`;

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'flex', alignItems: 'center' }}>
          <SecondaryTitle title={title} style={{ maxWidth: '60%' }}>{title}</SecondaryTitle>

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <Tag
              label={getUnitTagLabel(risk.unit)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={this.handleUnitClick}
            />

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

RiskInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

RiskInformation.propTypes = {
  risk: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    unit: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    begin: PropTypes.string,
    code: PropTypes.string,
    user: PropTypes.shape({ name: PropTypes.string }),
    manager: PropTypes.any,
    reason: PropTypes.string,
    probability: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    impact: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    periodicity: PropTypes.string,
    type: PropTypes.string,
    tipology: PropTypes.string,
    otherTipologies: PropTypes.any,
    strategies: PropTypes.shape({ list: PropTypes.array }),
    axes: PropTypes.shape({ list: PropTypes.array }),
    indicators: PropTypes.shape({ list: PropTypes.array }),
    goals: PropTypes.shape({ list: PropTypes.array }),
    activities: PropTypes.shape({ list: PropTypes.array }),
    result: PropTypes.string,
    response: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sharedUnits: PropTypes.array,
    level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    processObjectives: PropTypes.array,
    archived: PropTypes.bool,
    imported: PropTypes.bool,
    executionControllerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    existentControllerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    riskLevel: PropTypes.shape({
      level: PropTypes.string,
      color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};

RiskInformation.defaultProps = {
  risk: null,
};

export default RiskInformation;
