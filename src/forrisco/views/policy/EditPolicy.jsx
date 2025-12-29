import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import PolicyTabsForms from 'forpdi/src/forrisco/components/policy/PolicyTabsForms';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import { splitDateTime } from 'forpdi/src/utils/dateUtil';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import {
  matrixStringToProbabilityImpactRiskLevel,
  convertPIdescriptions,
  riskLevelsMatrixToMatrix,
} from 'forpdi/src/forrisco/helpers/policyHelper';

import Messages from 'forpdi/src/Messages';

class EditPolicy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policy: null,
    };
  }

  componentDidMount() {
    const { router } = this.context;
    const { params } = this.props;
    const { policyId } = params;

    PolicyStore.on('policyUpdated', () => {
      const { toastr } = this.context;
      router.push('/forrisco/policy');
      toastr.addAlertSuccess(Messages.get('notification.policy.edit'));
    }, this);

    PolicyStore.on('retrieverisklevel', ({ data }) => {
      const { policy } = this.state;

      const riskLevels = _.map(data,
        ({ level, color }) => ({ name: level, colorId: color }));

      this.setState({ policy: { ...policy, riskLevels } });
    }, this);

    PolicyStore.on('findpolicy', ({ data }) => {
      this.setInitialState(data);
    }, this);

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_FIND_POLICY,
      data: policyId,
    });

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_RETRIEVE_RISK_LEVEL,
      data: policyId,
    });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  setInitialState(data) {
    const {
      id, description, matrix, PIDescriptions, name, validityBegin, validityEnd,
    } = data;

    let { pdescriptions, idescriptions } = convertPIdescriptions(PIDescriptions);

    pdescriptions = _.map(pdescriptions,
      ({ value, description: pdesc }) => ({ name: value, description: pdesc }));
    idescriptions = _.map(idescriptions,
      ({ value, description: idesc }) => ({ name: value, description: idesc }));

    const { date: beginDate } = splitDateTime(validityBegin);
    const { date: endDate } = splitDateTime(validityEnd);

    const riskMatrix = matrixStringToProbabilityImpactRiskLevel(matrix);
    const { probabilities, impacts, riskLevelsMatrix } = riskMatrix;
    const editMatrix = riskLevelsMatrixToMatrix(probabilities, impacts, riskLevelsMatrix);

    this.setState({
      policy: {
        id,
        description,
        impacts: idescriptions,
        probabilities: pdescriptions,
        matrix: editMatrix,
        name,
        validityBegin: beginDate,
        validityEnd: endDate,
      },
    });
  }

  onChangeHandler = (policy, callback) => {
    this.setState({
      policy,
    }, callback);
  }

  submit(data) {
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_CUSTOM_UPDATE,
      data,
    });
  }

  render() {
    const { policy } = this.state;
    if (!policy || !policy.riskLevels) {
      return <LoadingGauge />;
    }

    return (
      <PolicyTabsForms
        policy={policy}
        submit={this.submit}
        onChange={this.onChangeHandler}
        isEdit
      />
    );
  }
}

EditPolicy.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPolicy.propTypes = {
  params: PropTypes.shape({
    policyId: PropTypes.string.isRequired,
  }).isRequired,
};

export default EditPolicy;
