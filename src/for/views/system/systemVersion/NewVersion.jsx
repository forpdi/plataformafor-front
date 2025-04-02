import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import validationVersion from 'forpdi/src/for/validations/validationVersion';
import VersionForm from 'forpdi/src/for/components/system/VersionForm';
import VersionStore from 'forpdi/src/forpdi/core/store/Version';

import Messages from 'forpdi/src/Messages';

class NewVersion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version: {
        numberVersion: '',
        releaseDate: null,
        infoFor: '',
        infoPdi: '',
        infoRisco: '',
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;

    VersionStore.on('versioncreated', () => {
      toastr.addAlertSuccess(Messages.get('label.versionAdded'));
      router.push('/system/version');
    }, this);

    VersionStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    VersionStore.off(null, null, this);
  }

  onChangeHandler = (version) => {
    this.setState({ version });
  }

  onSubmit = () => {
    const { version } = this.state;
    const {
      numberVersion, releaseDate, infoFor, infoPdi, infoRisco,
    } = version;

    const onSuccess = () => (
      VersionStore.dispatch({
        action: VersionStore.ACTION_NEW_VERSION,
        data: {
          numberVersion,
          releaseDate,
          infoFor,
          infoPdi,
          infoRisco,
        },
      })
    );

    validationVersion(version, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newAddVersion')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { version, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.newVersion') }]}
          topContainerContent={{ title: Messages.get('label.newVersion') }}
        >
          <TabbedPanel.MainContainer>
            <VersionForm
              errors={errors}
              version={version}
              onChange={this.onChangeHandler}
            />
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

NewVersion.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewVersion;
