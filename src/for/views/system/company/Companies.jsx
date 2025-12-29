import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import CompanyTable from 'forpdi/src/for/components/system/company/CompanyTable';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import AppContainer from 'forpdi/src/components/AppContainer';

import { SECONDARY_DEFAULT_PAGE_SIZE, SECONDARY_PAGINATION_OPTIONS } from 'forpdi/src/consts';
import { parseSortedByToList } from 'forpdi/src/utils/util';

import Messages from 'forpdi/src/Messages';
import CompanyStore from 'forpdi/src/forpdi/core/store/Company';

class Companies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: null,
      page: 1,
      pageSize: SECONDARY_DEFAULT_PAGE_SIZE,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const {
      page,
      pageSize,
      searchTerm,
      sortedBy,
    } = this.state;
    const { toastr } = this.context;

    CompanyStore.on('remove', ({ data }) => {
      const { companies } = this.state;
      const filteredCompanies = _.filter(companies, company => company.id !== data.id);
      this.setState({ companies: filteredCompanies });
      toastr.addAlertSuccess(Messages.get('notification.institution.delete'));
    }, this);

    CompanyStore.on('companies-listed', ({ data, total }) => {
      this.setState({
        companies: data,
        total,
      });
    }, this);

    this.findCompanies(page, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    CompanyStore.off(null, null, this);
  }

  findCompanies = (page, pageSize, searchTerm, sortedBy) => {
    this.setState({
      page,
      pageSize,
      sortedBy,
      companies: null,
      total: null,
    });
    CompanyStore.dispatch({
      action: CompanyStore.ACTION_LIST_COMPANIES,
      data: {
        page,
        pageSize,
        term: searchTerm,
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  clearSearch = () => {
    const { pageSize, searchTerm, sortedBy } = this.state;

    this.setState({ searchTerm: '' });
    this.findCompanies(1, pageSize, searchTerm, sortedBy);
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findCompanies(page, pageSize, searchTerm, sortedBy);
    this.setState({
      companies: null,
      page,
      pageSize,
    });
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortedBy) => {
    const { pageSize, searchTerm } = this.state;
    this.findCompanies(1, pageSize, searchTerm, newSortedBy);
  };

  renderTopContent() {
    const { router } = this.context;
    const {
      waitingSubmit,
      searchTerm,
      pageSize,
    } = this.state;

    return (
      <TabbedPanel.TopContainer style={{ display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <SecondaryTitle>{Messages.get('label.institutions')}</SecondaryTitle>
          <PrimaryButton
            text={Messages.get('label.newInstitution')}
            title={Messages.get('label.newInstitution')}
            onClick={() => router.push('/system/companies/new')}
            loading={waitingSubmit}
          />
        </div>
        <SearchBox
          value={searchTerm}
          placeholder={Messages.get('label.search')}
          onChange={this.onSearchTermChange}
          onSubmit={term => this.findCompanies(1, pageSize, term, [])}
        />
      </TabbedPanel.TopContainer>
    );
  }

  renderMainContent() {
    const {
      companies,
      page,
      pageSize,
      sortedBy,
      total,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel.MainContainer>
          {
            companies
              ? (
                <CompanyTable
                  companies={companies}
                  onSort={this.onSort}
                  sortedBy={sortedBy}
                />
              )
              : <LoadingGauge />
          }
        </TabbedPanel.MainContainer>
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
          options={SECONDARY_PAGINATION_OPTIONS}
        />
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

Companies.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
};

export default Companies;
