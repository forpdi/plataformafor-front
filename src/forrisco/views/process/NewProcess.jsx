import React from 'react';
import PropTypes from 'prop-types';

import validationProcess from 'forpdi/src/forrisco/validations/validationProcess';
import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ProcessForm from 'forpdi/src/forrisco/components/process/ProcessForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';

const emptyObjectives = [{ value: '' }];

class NewProcess extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      process: {
        name: '',
        objective: '',
        allObjectives: [...emptyObjectives],
        relatedUnits: [],
        fileLink: '',
        file: null,
      },
      unit: null,
      fileData: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { unitId } = params;

    UnitStore.on('unitRetrieved', ({ data }) => {
      this.setState({ unit: data });
    }, this);

    ProcessStore.on('processCreated', () => {
      const { unit } = this.state;
      toastr.addAlertSuccess(Messages.get('label.notification.process.create'));
      if (unit.parent) {
        router.push(`/forrisco/subunit/${unit.id}/processes`);
      } else {
        router.push(`/forrisco/unit/${unit.id}/processes`);
      }
    }, this);

    ProcessStore.on('fail', () => this.setState({ waitingSubmit: false }));

    UnitStore.dispatch({
      action: UnitStore.ACTION_RETRIEVE_UNIT,
      data: unitId,
    });
  }

  componentWillUnmount() {
    ProcessStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  onChangeHandler = (process) => {
    this.setState({
      process,
    });
  }

  onSubmit = () => {
    const { process, fileData, unit } = this.state;

    const onSuccess = () => {
      const data = {
        process: {
          ...process,
          unit: { id: unit.id },
          fileData,
        },
      };

      ProcessStore.dispatch({
        action: ProcessStore.ACTION_CREATE,
        data,
      });
    };

    validationProcess(process, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.processRegister')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { process, errors, unit } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: Messages.get('label.processRegister') }}
        >
          <TabbedPanel.MainContainer>
            {
              process && unit ? (
                <ProcessForm
                  errors={errors}
                  process={process}
                  onChange={this.onChangeHandler}
                  unit={unit}
                  relatedUnits={process.relatedUnits}
                />
              ) : (
                <LoadingGauge />
              )
            }
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewProcess.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewProcess.propTypes = {
  location: PropTypes.shape({}).isRequired,
  params: PropTypes.shape({}).isRequired,
};

export default NewProcess;
