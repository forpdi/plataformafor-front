import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import Messages from 'forpdi/src/Messages';

const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };

class ExportCSVModal extends React.Component {
  constructor(props) {
    super(props);

    const { id: selectedYear } = props.years[0];

    this.state = {
      selectedYear,
      selectedAxis: viewAllOption.id,
      axes: null,
    };
  }

  componentDidMount() {
    StructureStore.on('axesretrieved', ({ data }) => {
      const axes = [
        viewAllOption,
        ...data,
      ];

      this.setState({ axes });
    }, this);

    StructureStore.dispatch({
      action: StructureStore.ACTION_GET_AXES,
    });
  }

  componentWillUnmount() {
    StructureStore.off(null, null, this);
  }

  onChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  }

  onExportHandler = () => {
    const { onExport } = this.props;
    const { selectedAxis, selectedYear } = this.state;

    onExport(selectedAxis, selectedYear);
    Modal.hide();
  }

  renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.exportCSV')}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderAxis() {
    const { selectedAxis, axes } = this.state;

    return (
      <div>
        <SelectBox
          name="selectedAxis"
          containerStyle={{ marginTop: 0 }}
          options={axes}
          label={Messages.get('label.title.thematicAxes')}
          value={selectedAxis}
          onChange={this.onChange}
        />
      </div>
    );
  }

  renderPeriodicity() {
    const { years } = this.props;
    const { selectedYear } = this.state;

    return (
      <div style={{ marginTop: '2rem' }}>
        <SelectBox
          name="selectedYear"
          containerStyle={{ marginTop: 0, width: '35%' }}
          options={years}
          label={Messages.get('label.period')}
          value={selectedYear}
          onChange={this.onChange}
        />
      </div>
    );
  }

  renderButtons() {
    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <SecondaryButton
          text={Messages.get('label.cancel')}
          onClick={Modal.hide}
          backgroundClassName="frisco-primary"
        />
        <PrimaryButton
          text={Messages.get('label.export')}
          onClick={this.onExportHandler}
        />
      </div>
    );
  }

  renderContent() {
    const { axes } = this.state;

    return axes ? (
      <div>
        {this.renderAxis()}
        {this.renderPeriodicity()}
        {this.renderButtons()}
      </div>
    ) : <LoadingGauge />;
  }

  render() {
    return (
      <Modal width="650px" height="350px">
        {this.renderHeader()}
        {this.renderContent()}
      </Modal>
    );
  }
}

ExportCSVModal.propTypes = {
  onExport: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ExportCSVModal;
