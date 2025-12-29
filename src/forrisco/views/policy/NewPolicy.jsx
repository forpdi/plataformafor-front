import React from 'react';
import PropTypes from 'prop-types';

import PolicyTabsForms from 'forpdi/src/forrisco/components/policy/PolicyTabsForms';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import Messages from 'forpdi/src/Messages';

const emptyProbabilitiesImpacts = [
  { name: '', description: '' },
  { name: '', description: '' },
];
const emptyRiskLevels = [
  { name: '', colorId: undefined },
];

class NewPolicy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policy: null,
    };
  }

  componentDidMount() {
    const { router } = this.context;

    this.setState({
      policy: {
        description: '',
        impacts: [...emptyProbabilitiesImpacts],
        probabilities: [...emptyProbabilitiesImpacts],
        riskLevels: [...emptyRiskLevels],
        matrix: null,
        name: '',
        validityBegin: '',
        validityEnd: '',
      },
    });

    PolicyStore.on('policycreated', () => {
      const { toastr } = this.context;
      toastr.addAlertSuccess(Messages.get('notification.policy.save'));
      router.push('/forrisco/policy');
    }, this);
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  onChangeHandler = (policy, callback) => {
    this.setState({
      policy,
    }, callback);
  }

  submit(data) {
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_NEWPOLICY,
      data,
    });
  }

  render() {
    const { policy, riskLevels } = this.state;
    if (!policy && !riskLevels) {
      return <LoadingGauge />;
    }

    return (
      <PolicyTabsForms policy={policy} submit={this.submit} onChange={this.onChangeHandler} />
    );
  }
}

NewPolicy.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewPolicy;
