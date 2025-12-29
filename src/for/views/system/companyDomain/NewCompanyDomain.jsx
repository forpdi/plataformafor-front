import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import validationCompanyDomain from 'forpdi/src/for/validations/validationCompanyDomain';
import CompanyDomainForm from 'forpdi/src/for/components/system/companyDomain/CompanyDomainForm';

import Messages from 'forpdi/src/Messages';
import CompanyDomainStore from 'forpdi/src/forpdi/core/store/CompanyDomain';


class NewCompanyDomain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companyDomain: {
        baseUrl: '',
        companyId: undefined,
        host: '',
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;

    CompanyDomainStore.on('domain-created', () => {
      toastr.addAlertSuccess(Messages.get('notification.domain.save'));
      router.push('/system/domains');
    }, this);

    CompanyDomainStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    CompanyDomainStore.off(null, null, this);
  }

  onChangeHandler = (companyDomain) => {
    this.setState({ companyDomain });
  }

  onSubmit = () => {
    const { companyDomain } = this.state;
    const { companyId } = companyDomain;

    const onSuccess = () => (
      CompanyDomainStore.dispatch({
        action: CompanyDomainStore.ACTION_CREATE,
        data: { ...companyDomain, company: { id: companyId } },
      })
    );

    validationCompanyDomain(companyDomain, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newDomain')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { companyDomain, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.domain') }]}
          topContainerContent={{ title: Messages.get('label.domain') }}
        >
          <TabbedPanel.MainContainer>
            <CompanyDomainForm
              errors={errors}
              companyDomain={companyDomain}
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

NewCompanyDomain.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewCompanyDomain;
