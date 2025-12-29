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

class NewCompany extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      company: {
        name: '',
        logo: '',
        type: undefined,
        description: '',
        initials: '',
        countyId: undefined,
        enableForrisco: true,
        showBudgetElement: true,
        showDashboard: true,
        showMaturity: true,
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;

    CompanyStore.on('create', ({ data }) => {
      toastr.addAlertSuccess(Messages.get('notification.institution.save'));
      router.push(`/system/companies/info/${data.id}`);
    }, this);

    CompanyStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
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
        action: CompanyStore.ACTION_CREATE,
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

NewCompany.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewCompany;
