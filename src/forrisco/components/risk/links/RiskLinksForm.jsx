import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import InfoDisplayListAccordion from 'forpdi/src/components/info/InfoDisplayListAccordion';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import Text from 'forpdi/src/components/typography/Text';
import SelectPdiLinksModal from 'forpdi/src/forrisco/components/risk/links/SelectPdiLinksModal';
import SelectProcessObjectivesModal from 'forpdi/src/forrisco/components/risk/links/SelectProcessObjectivesModal';
import SelectProcessActivitiesModal from 'forpdi/src/forrisco/components/risk/links/SelectProcessActivitiesModal';

import Messages from 'forpdi/src/Messages';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';

const buttonsStyle = { margin: 0 };

class RiskLinksForm extends React.Component {
  onHandleRenderDeleteModal(linkList, link, name) {
    const modalText = Messages.get('label.deleteLinkConfirmation');

    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deleteLink(linkList, link, name)}
      />
    );
    Modal.show(confirmModal);
  }

  deleteLink(linkList, link, name) {
    const { onChange, risk } = this.props;
    const updatedLinkList = linkList.filter(elem => elem !== link);

    onChange({ ...risk, [name]: updatedLinkList });
  }

  renderPdiSelectedLinks(label, checkedValues, onHandleModal, name) {
    const renderItem = item => (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
      }}
      >
        <Text
          syle={{ textAlign: 'left' }}
          text={item.name}
          maxLength={65}
        />
        <IconButton
          icon="trash"
          title={Messages.get('label.view')}
          onClick={() => this.onHandleRenderDeleteModal(checkedValues, item, name)}
        />
      </div>
    );

    return this.renderSelectedLinks(label, checkedValues, onHandleModal, name, renderItem);
  }

  renderProcessSelectedLinks(label, checkedValues, onHandleModal, name, linkLabel, itemFieldName = 'name') {
    const renderItem = item => (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
      }}
      >
        <div style={{ width: '45%' }}>
          <Text
            style={{ textTransform: 'uppercase', fontSize: 9 }}
            text={Messages.get('label.process')}
            maxLength={65}
          />
          <Text
            text={item.process.name}
            maxLength={65}
          />
        </div>
        <div style={{ width: '45%' }}>
          <Text
            style={{ textTransform: 'uppercase', fontSize: 9 }}
            text={linkLabel}
            maxLength={65}
          />
          <Text
            text={item[itemFieldName]}
            maxLength={65}
          />
        </div>
        <IconButton
          icon="trash"
          title={Messages.get('label.view')}
          onClick={() => this.onHandleRenderDeleteModal(checkedValues, item, name)}
        />
      </div>
    );

    return this.renderSelectedLinks(label, checkedValues, onHandleModal, name, renderItem);
  }

  renderSelectedLinks(label, checkedValues, onHandleModal, name, renderItem) {
    const { linksDisabled } = this.props;

    return (
      <div>
        <InfoDisplayListAccordion
          label={label}
          infoList={linksDisabled ? [] : checkedValues}
          renderItem={renderItem}
          onClick={link => this.onHandleRenderDeleteModal(checkedValues, link, name)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <PrimaryButton
            title={Messages.get('label.includeLinks')}
            text={Messages.get('label.includeLinks')}
            onClick={() => onHandleModal()}
            style={buttonsStyle}
            disabled={linksDisabled}
          />
        </div>
      </div>
    );
  }

  onHandleProcessActivitiesModal = () => {
    const {
      onChange, risk, planRisk,
    } = this.props;
    const { activities } = risk;

    const modal = (
      <SelectProcessActivitiesModal
        planRiskId={planRisk.id}
        defaultCheckedValues={activities}
        onSubmit={updatedCheckList => onChange({ ...risk, activities: updatedCheckList })}
      />
    );

    Modal.show(modal);
  }

  onHandleProcessObjectivesModal = () => {
    const {
      onChange, risk, planRisk,
    } = this.props;
    const { checkedObjectives } = risk;

    const modal = (
      <SelectProcessObjectivesModal
        planRiskId={planRisk.id}
        heading={Messages.get('label.risk.registerProcessObjective')}
        label={Messages.get('label.risk.processObjective')}
        defaultCheckedValues={checkedObjectives}
        onSubmit={updatedCheckList => onChange({ ...risk, checkedObjectives: updatedCheckList })}
      />
    );

    Modal.show(modal);
  }

  onHandleAxesModal = () => {
    const {
      onChange, risk,
    } = this.props;
    const { checkedAxes } = risk;

    const modal = (
      <SelectPdiLinksModal
        action={StructureStore.ACTION_FILTER_AXES}
        triggerName="axeslisted"
        heading={Messages.get('label.risk.registerAxisPDI')}
        label={Messages.get('label.risk.axisPDIConfirmation')}
        defaultCheckedValues={checkedAxes}
        onSubmit={updatedCheckList => onChange({ ...risk, checkedAxes: updatedCheckList })}
      />
    );

    Modal.show(modal);
  };

  onHandleStrategiesModal = () => {
    const {
      onChange, risk,
    } = this.props;
    const { checkedStrategies } = risk;

    const modal = (
      <SelectPdiLinksModal
        action={StructureStore.ACTION_FILTER_OBJECTIVES}
        triggerName="objectiveslisted"
        heading={Messages.get('label.risk.registerObjectivePDI')}
        label={Messages.get('label.risk.objectivePDIConfirmation')}
        defaultCheckedValues={checkedStrategies}
        onSubmit={updatedCheckList => onChange({ ...risk, checkedStrategies: updatedCheckList })}
      />
    );

    Modal.show(modal);
  };

  onHandleIndicatorModal = () => {
    const {
      onChange, risk,
    } = this.props;
    const { checkedIndicators } = risk;

    const modal = (
      <SelectPdiLinksModal
        action={StructureStore.ACTION_FILTER_INDICATORS}
        triggerName="indicatorslisted"
        heading={Messages.get('label.risk.registerIndicatorPDI')}
        label={Messages.get('label.risk.indicatorPDIConfirmation')}
        defaultCheckedValues={checkedIndicators}
        onSubmit={updatedCheckList => onChange({ ...risk, checkedIndicators: updatedCheckList })}
      />
    );

    Modal.show(modal);
  };

  onHandleGoalModal = () => {
    const {
      onChange, risk,
    } = this.props;
    const { checkedGoals } = risk;

    const modal = (
      <SelectPdiLinksModal
        action={StructureStore.ACTION_FILTER_GOALS}
        triggerName="goalslisted"
        heading={Messages.get('label.risk.registerGoalPDI')}
        label={Messages.get('label.risk.goalPDIConfirmation')}
        defaultCheckedValues={checkedGoals}
        onSubmit={updatedCheckList => onChange({ ...risk, checkedGoals: updatedCheckList })}
      />
    );

    Modal.show(modal);
  };

  renderLinksDisabledInfo() {
    return (
      <SystemInfo>
        Não é possível editar as informações abaixo. Os dados de vinculação deverão ser atualizados pontualmente no risco replicado.
      </SystemInfo>
    );
  }

  renderSelectProcessActivities() {
    const { risk } = this.props;
    const { activities } = risk;

    return (
      <InputContainer>
        {this.renderProcessSelectedLinks(
          Messages.get('label.ActivitiesRisk'),
          activities,
          this.onHandleProcessActivitiesModal,
          'activities',
          Messages.get('label.linkedActivity'),
        )}
      </InputContainer>
    );
  }

  renderSelectProcessObjectives() {
    const { risk } = this.props;
    const { checkedObjectives } = risk;

    return (
      <InputContainer>
        {this.renderProcessSelectedLinks(
          Messages.get('label.risk.objectiveProcess'),
          checkedObjectives,
          this.onHandleProcessObjectivesModal,
          'checkedObjectives',
          Messages.get('label.linkedObjective'),
          'description',
        )}
      </InputContainer>
    );
  }

  renderSelectAxes() {
    const { risk } = this.props;
    const { checkedAxes } = risk;

    return (
      <InputContainer>
        {this.renderPdiSelectedLinks(
          Messages.get('label.risk.axisPDI'),
          checkedAxes,
          this.onHandleAxesModal,
          'checkedAxes',
        )}
      </InputContainer>
    );
  }

  renderSelectStrategies() {
    const { risk } = this.props;
    const { checkedStrategies } = risk;

    return (
      <InputContainer>
        {this.renderPdiSelectedLinks(
          Messages.get('label.risk.objectivePDI'),
          checkedStrategies,
          this.onHandleStrategiesModal,
          'checkedStrategies',
        )}
      </InputContainer>
    );
  }

  renderSelectIndicators() {
    const { risk } = this.props;
    const { checkedIndicators } = risk;

    return (
      <InputContainer>
        {this.renderPdiSelectedLinks(
          Messages.get('label.risk.registerIndicatorPDI'),
          checkedIndicators,
          this.onHandleIndicatorModal,
          'checkedIndicators',
        )}
      </InputContainer>
    );
  }

  renderSelectGoals() {
    const { risk } = this.props;
    const { checkedGoals } = risk;

    return (
      <InputContainer>
        {this.renderPdiSelectedLinks(
          Messages.get('label.risk.registerGoalPDI'),
          checkedGoals,
          this.onHandleGoalModal,
          'checkedGoals',
        )}
      </InputContainer>
    );
  }

  render() {
    const { linksDisabled } = this.props;
    return (
      <div>
        {linksDisabled && this.renderLinksDisabledInfo()}

        {this.renderSelectProcessActivities()}

        {this.renderSelectProcessObjectives()}

        {this.renderSelectAxes()}

        {this.renderSelectStrategies()}

        {this.renderSelectIndicators()}

        {this.renderSelectGoals()}
      </div>
    );
  }
}

RiskLinksForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  risk: PropTypes.shape({}).isRequired,
  planRisk: PropTypes.shape({}),
  linksDisabled: PropTypes.bool,
};

RiskLinksForm.defaultProps = {
  planRisk: null,
  linksDisabled: false,
};

RiskLinksForm.contextTypes = {
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

export default RiskLinksForm;
