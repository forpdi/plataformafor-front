import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import CompanyForm from 'forpdi/src/for/components/system/company/CompanyForm';
import validationCompany from 'forpdi/src/for/validations/validationCompany';

import Messages from 'forpdi/src/Messages';
import CompanyStore from 'forpdi/src/forpdi/core/store/Company';


class EditCompany extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      company: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { companyId } = params;

    CompanyStore.on('retrieve', ({ attributes }) => {
      const { county } = attributes;
      this.setState({
        company: { ...attributes, countyId: county.id },
      });
    }, this);

    CompanyStore.on('update', () => {
      toastr.addAlertSuccess(Messages.get('notification.institution.update'));
      router.push(`/system/companies/info/${companyId}`);
    }, this);

    CompanyStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_RETRIEVE,
      data: companyId,
    });
  }

  componentWillUnmount() {
    CompanyStore.off(null, null, this);
  }

  onChangeHandler = (company) => {
    this.setState({ company });
  }

  onSubmit = () => {
    const { company } = this.state;
    const { countyId } = company;

    const onSuccess = () => (
      CompanyStore.dispatch({
        action: CompanyStore.ACTION_UPDATE,
        data: {
          ...company,
          county: { id: countyId },
        },
      })
    );

    validationCompany(company, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newInstitution')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { company, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.institution') }]}
          topContainerContent={{ title: Messages.get('label.institution') }}
        >
          <TabbedPanel.MainContainer>
            {
              company
                ? (
                  <CompanyForm
                    errors={errors}
                    company={company}
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

EditCompany.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

EditCompany.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default EditCompany;
