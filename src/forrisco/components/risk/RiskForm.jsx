import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import TextField from 'forpdi/src/components/inputs/TextField';
import MultiSelectCheckBoxes from 'forpdi/src/components/inputs/MultiSelectCheckBoxes';
import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import CheckBoxGroup from 'forpdi/src/components/inputs/CheckBoxGroup';
import ResponsibleSelectors from 'forpdi/src/forrisco/components/risk/ResponsibleSelectors';
import Modal from 'forpdi/src/components/modals/Modal';
import RiskResponseInfoModal from 'forpdi/src/forrisco/components/risk/RiskResponseInfoModal';
import SharedUnitsInfoModal from 'forpdi/src/forrisco/components/risk/SharedUnitsInfoModal';
import InfoButton from 'forpdi/src/components/buttons/InfoButton';
import RiskLinksForm from 'forpdi/src/forrisco/components/risk/links/RiskLinksForm';

import { probabilityImpactToOptions, existsCheckedOthers, shouldDisplayUnitsToShare } from 'forpdi/src/forrisco/helpers/riskHelper';
import Messages from 'forpdi/src/Messages';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import UserStore from 'forpdi/src/forpdi/core/store/User';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import typologiesEnum from 'forpdi/src/forrisco/enums/typologies';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevelEnum from 'forpdi/src/forrisco/enums/riskLevel';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';

const periodicityOptions = [
  { name: 'Diária' },
  { name: 'Semanal' },
  { name: 'Quinzenal' },
  { name: 'Mensal' },
  { name: 'Bimestral' },
  { name: 'Trimestral' },
  { name: 'Semestral' },
  { name: 'Anual' },
];

const maxCheckedTypologies = 3;

class RiskForm extends React.Component {
  constructor(props) {
    super(props);
    const { archived } = props.risk;

    this.state = {
      riskStatus: archived,
      units: [],
    };
  }

  componentDidMount() {
    UnitStore.on('listToSelect', ({ data }) => {
      this.setState({
        units: data.list,
      });
    }, this);

    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_TO_SELECT,
    });
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
    StructureStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  onChangeHandler = (event) => {
    const { onChange, risk } = this.props;

    const { name, value } = event.target;
    onChange({ ...risk, [name]: value });
  }

  onRiskStatusChangeHandler = (event) => {
    const { onChange, risk } = this.props;
    const { name, value } = event.target;
    const statusValue = value === 'true';

    this.setState({ riskStatus: statusValue });
    onChange({ ...risk, [name]: statusValue });
  }

  onChangeMultiselect = (values, name) => {
    const { onChange, risk } = this.props;

    onChange({ ...risk, [name]: values });
  }

  onChangeTypologies = (values) => {
    const { onChange, risk } = this.props;

    const checkedTypologies = _.filter(typologiesEnum.list, ({ value }) => values.includes(value));

    if (checkedTypologies.length <= maxCheckedTypologies) {
      onChange({ ...risk, checkedTypologies });
    }
  }

  showRiskResponseInfo = () => {
    const riskResponseInfoModal = (
      <RiskResponseInfoModal />
    );
    Modal.show(riskResponseInfoModal);
  };

  showSharedUnitsInfo = () => {
    const riskResponseInfoModal = (
      <SharedUnitsInfoModal />
    );
    Modal.show(riskResponseInfoModal);
  };

  renderImpactAndProbability = () => {
    const { risk, policy, errors } = this.props;

    const { probability, impact } = risk;

    const { impact: policyImpact, probability: policyProbability } = policy;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={probabilityImpactToOptions(policyProbability)}
            label={Messages.get('label.probability')}
            value={probability}
            errorMsg={errors.probability}
            name="probability"
            id="probability"
            onChange={this.onChangeHandler}
            showChooseOption
            required
          />
        </div>
        <div className="col col-sm-6">
          <SelectBox
            options={probabilityImpactToOptions(policyImpact)}
            label={Messages.get('label.impact')}
            value={impact}
            errorMsg={errors.impact}
            name="impact"
            id="impact"
            onChange={this.onChangeHandler}
            showChooseOption
            required
          />
        </div>
      </InputContainer>
    );
  }

  renderRiskResponse() {
    const { units } = this.state;
    const { risk } = this.props;
    const { response, sharedUnits } = risk;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={riskResponseEnum.list}
            label={(
              <span>
                {Messages.get('label.riskResponse')}
                <InfoButton style={{ marginLeft: '5px' }} onClick={this.showRiskResponseInfo} />
              </span>
            )}
            value={response}
            name="response"
            id="response"
            onChange={this.onChangeHandler}
            showChooseOption
            enableChooseOptionSelection
            chooseOptionLabel={Messages.get('label.uninformed')}
          />
        </div>
        <div className="col col-sm-6">
          {
            shouldDisplayUnitsToShare(response) && (
              <MultiSelectCheckBoxes
                placeholderButtonLabel={Messages.get('label.selectUniOrSubunit')}
                options={units}
                value={sharedUnits}
                onChange={values => this.onChangeMultiselect(values, 'sharedUnits')}
                label={(
                  <span>
                    {Messages.get('label.unitSubunit')}
                    <InfoButton style={{ marginLeft: '5px' }} onClick={this.showSharedUnitsInfo} />
                  </span>
                )}
                cutOptions
              />
            )
          }
        </div>
      </InputContainer>
    );
  }

  renderRiskLevel() {
    const { risk } = this.props;
    const { level } = risk;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={riskLevelEnum.list}
            label={(
              <span>
                {Messages.get('label.organizationalLevel')}
              </span>
            )}
            value={level}
            name="level"
            id="level"
            onChange={this.onChangeHandler}
            showChooseOption
            enableChooseOptionSelection
            chooseOptionLabel={Messages.get('label.uninformed')}
          />
        </div>
      </InputContainer>
    );
  }

  renderRiskLinksForm() {
    const {
      risk,
      onChange,
      linksDisabled,
      planRisk,
    } = this.props;

    return (
      <RiskLinksForm
        onChange={onChange}
        linksDisabled={linksDisabled}
        risk={risk}
        planRisk={planRisk}
      />
    );
  }

  render() {
    const { riskStatus } = this.state;
    const { risk, errors } = this.props;
    const {
      id,
      name,
      code,
      reason,
      result,
      userId,
      managerId,
      periodicity,
      type,
      checkedTypologies,
      otherTypologies,
      manager,
      user,
    } = risk;

    const { hasForriscoManageRiskPermission } = this.context;
    const checkedOthers = existsCheckedOthers(checkedTypologies);

    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={Messages.get('label.risk.name')}
          onChange={this.onChangeHandler}
          value={name}
          errorMsg={errors.name}
          maxLength={255}
          required
          disabled={!hasForriscoManageRiskPermission}
        />
        <InputContainer className="row">
          <div className="col col-sm-6">
            <TextField
              id="code"
              name="code"
              label={Messages.get('label.risk.id')}
              onChange={this.onChangeHandler}
              value={code}
              maxLength={255}
              disabled={!hasForriscoManageRiskPermission}
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              value={riskStatus}
              options={riskArchivedStatus.list}
              label={Messages.get('label.stateOfRisk')}
              name="archived"
              id="archived"
              onChange={this.onRiskStatusChangeHandler}
              disabled={!id || !hasForriscoManageRiskPermission}
            />
          </div>
        </InputContainer>
        <ResponsibleSelectors
          onChange={this.onChangeHandler}
          defaultUser={user}
          defaultManager={manager}
          selectedUserId={userId}
          selectedManagerId={managerId}
          errors={errors}
        />
        <RichTextArea
          id="reason"
          name="reason"
          label={Messages.get('label.causes')}
          onChange={this.onChangeHandler}
          value={reason}
          errorMsg={errors.reason}
          maxLength={4000}
          required
        />

        <RichTextArea
          id="result"
          name="result"
          label={Messages.get('label.consequences')}
          onChange={this.onChangeHandler}
          value={result}
          errorMsg={errors.result}
          maxLength={4000}
        />

        {this.renderImpactAndProbability()}

        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={periodicityOptions}
              label={Messages.get('label.monitoringPeriod')}
              value={periodicity}
              errorMsg={errors.periodicity}
              name="periodicity"
              id="periodicity"
              onChange={this.onChangeHandler}
              optionValueName="name"
              showChooseOption
              required
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              options={riskType.list}
              label={Messages.get('label.typeLegend')}
              value={type}
              errorMsg={errors.type}
              optionValueName="name"
              name="type"
              id="type"
              onChange={this.onChangeHandler}
              showChooseOption
              required
            />
          </div>
        </InputContainer>

        {this.renderRiskResponse()}
        {this.renderRiskLevel()}

        <InputContainer>
          <CheckBoxGroup
            groupName="tipology"
            label={Messages.get('label.noTypologySelected')}
            onChange={this.onChangeTypologies}
            errorMsg={errors.checkedTypologies}
            options={typologiesEnum.list}
            checkedValues={_.map(checkedTypologies, ({ value }) => value)}
            optionLabelName="label"
            optionValueName="value"
            checksContainerStyle={{ overflow: 'hidden' }}
            required
          />
          {checkedOthers && (
            <TextField
              id="otherTypologies"
              name="otherTypologies"
              placeholder={Messages.get('label.informOtherTypologies')}
              label={Messages.get('label.otherTypologies')}
              onChange={this.onChangeHandler}
              value={otherTypologies}
              errorMsg={errors.otherTypologies}
              maxLength={255}
              required
            />
          )}
        </InputContainer>

        {this.renderRiskLinksForm()}
      </div>
    );
  }
}

RiskForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  risk: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}),
  policy: PropTypes.shape({}).isRequired,
  planRisk: PropTypes.shape({}),
  linksDisabled: PropTypes.bool,
};

RiskForm.defaultProps = {
  errors: {},
  planRisk: null,
  linksDisabled: false,
};

RiskForm.contextTypes = {
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

export default RiskForm;
