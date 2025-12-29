import React from 'react';
import PropTypes from 'prop-types';

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import AppContainer from 'forpdi/src/components/AppContainer';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';

class RiskRoutesWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      risk: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { router } = this.context;

    RiskStore.on('findRisk', (response) => {
      this.setState({
        risk: response.data,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_RISK,
      data: params.riskId,
    });

    RiskStore.on('notFound', () => { router.push('/not-found'); });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;
    if (params !== prevProps.params) {
      RiskStore.dispatch({
        action: RiskStore.ACTION_FIND_RISK,
        data: prevProps.params.riskId,
      });
    }
  }

  render() {
    const { risk } = this.state;
    const { children } = this.props;

    return (
      <AppContainer.Content>
        {risk ? React.cloneElement(children, { risk }) : <LoadingGauge />}
      </AppContainer.Content>
    );
  }
}

RiskRoutesWrapper.propTypes = {
  params: PropTypes.shape({
    riskId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

RiskRoutesWrapper.defaultProps = {
  children: null,
};

RiskRoutesWrapper.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default RiskRoutesWrapper;
