import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';
import DashboardChartPanel from 'forpdi/src/components/dashboard/DashboardChartPanel';

class DashboardChartModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      canRenderChart: false,
    };
  }

  componentDidMount() {
    this.setRenderChartFlagTimeout = setTimeout(
      () => this.setState({ canRenderChart: true }),
      200,
    );
  }

  componentWillUnmount() {
    clearTimeout(this.setRenderChartFlagTimeout);
  }

  render() {
    const { heading, subHeading, chartProps } = this.props;
    const { canRenderChart } = this.state;

    return (
      <Modal width="650px" height="500px">
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 20px' }}>
          <SecondaryTitle>
            {heading}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
        <Text style={{ margin: '0 0 10px 20px' }}>
          {subHeading}
        </Text>

        <div>
          {canRenderChart && <DashboardChartPanel {...chartProps} />}
        </div>
      </Modal>
    );
  }
}


DashboardChartModal.propTypes = {
  heading: PropTypes.string.isRequired,
  subHeading: PropTypes.string,
  chartProps: PropTypes.shape({}).isRequired,
};

DashboardChartModal.defaultProps = {
  subHeading: null,
};

export default DashboardChartModal;
