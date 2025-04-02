import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import CompanyDomainForm from 'forpdi/src/for/components/system/companyDomain/CompanyDomainForm';
import validationCompanyDomain from 'forpdi/src/for/validations/validationCompanyDomain';

import Messages from 'forpdi/src/Messages';
import CompanyDomainStore from 'forpdi/src/forpdi/core/store/CompanyDomain';


class EditCompanyDomain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companyDomain: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;
    const { companyDomainId } = params;

    CompanyDomainStore.on('domain-updated', () => {
      toastr.addAlertSuccess(Messages.get('notification.domain.update'));
      router.push('/system/domains');
    }, this);

    CompanyDomainStore.on('retrieve', ({ attributes }) => {
      const { company } = attributes;
      const { id: companyId } = company;

      this.setState({ companyDomain: { ...attributes, companyId } });
    }, this);

    CompanyDomainStore.dispatch({
      action: CompanyDomainStore.ACTION_RETRIEVE,
      data: companyDomainId,
    });

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
        action: CompanyDomainStore.ACTION_UPDATE,
        data: { ...companyDomain, company: { id: companyId } },
      })
    );

    validationCompanyDomain(companyDomain, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editDomain')}
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
            {
              companyDomain
                ? (
                  <CompanyDomainForm
                    errors={errors}
                    companyDomain={companyDomain}
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

EditCompanyDomain.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

EditCompanyDomain.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default EditCompanyDomain;
