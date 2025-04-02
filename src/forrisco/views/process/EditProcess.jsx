import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ProcessForm from 'forpdi/src/forrisco/components/process/ProcessForm';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import validationProcess from 'forpdi/src/forrisco/validations/validationProcess';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditProcess extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      process: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;

    ProcessStore.on('processRetrieved', (response) => {
      if (response !== null) {
        this.setState({
          process: response.data,
          responsible: response.data.unitCreator.id,
          unit: response.data.unitCreator,
        });
      }
    }, this);

    ProcessStore.on('processUpdated', () => {
      router.goBack();
      toastr.addAlertSuccess(Messages.get('label.notification.process.update'));
    }, this);

    ProcessStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    ProcessStore.dispatch({
      action: ProcessStore.ACTION_RETRIEVE_PROCESS,
      data: params.processId,
    });
  }

  componentWillUnmount() {
    ProcessStore.off(null, null, this);
  }

  onChangeHandler = (process) => {
    this.setState({
      process,
    });
  }

  onSubmit = () => {
    const { process, responsible } = this.state;

    const onSuccess = () => {
      const data = {
        process: {
          ...process,
          unit: { id: responsible },
        },
      };

      ProcessStore.dispatch({
        action: ProcessStore.ACTION_UPDATE,
        data,
      });
    };

    validationProcess(process, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editProcess')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const {
      process,
      errors,
      unit,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: Messages.get('label.generalInfo') }}
        >
          <TabbedPanel.MainContainer>
            {
              process ? (
                <ProcessForm
                  errors={errors}
                  process={process}
                  onChange={this.onChangeHandler}
                  unit={unit}
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

EditProcess.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditProcess.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default EditProcess;
