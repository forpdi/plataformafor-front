import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import validationVersion from 'forpdi/src/for/validations/validationVersion';
import VersionForm from 'forpdi/src/for/components/system/VersionForm';
import VersionStore from 'forpdi/src/forpdi/core/store/Version';


class EditVersion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;
    const { versionId } = params;

    VersionStore.on('versionUpdated', () => {
      toastr.addAlertSuccess(Messages.get('label.versionUpdated'));
      router.push('/system/version');
    }, this);

    VersionStore.on('retrieve', ({ attributes }) => {
      this.setState({ version: { ...attributes } });
    }, this);

    VersionStore.dispatch({
      action: VersionStore.ACTION_RETRIEVE,
      data: versionId,
    });

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
    const { versionId } = version;

    const onSuccess = () => (
      VersionStore.dispatch({
        action: VersionStore.ACTION_UPDATE_VERSION,
        data: { ...version, version: { id: versionId } },
      })
    );

    validationVersion(version, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editVersion')}
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
          tabs={[{ label: Messages.get('label.editVersion') }]}
          topContainerContent={{ title: Messages.get('label.editVersion') }}
        >
          <TabbedPanel.MainContainer>
            {
              version
                ? (
                  <VersionForm
                    errors={errors}
                    version={version}
                    onChange={this.onChangeHandler}
                  />
                ) : <LoadingGauge />
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

EditVersion.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

EditVersion.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default EditVersion;
