import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components//inputs/SearchBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import AppContainer from 'forpdi/src/components/AppContainer';
import CompanyDomainTable from 'forpdi/src/for/components/system/companyDomain/CompanyDomainTable';

import { SECONDARY_DEFAULT_PAGE_SIZE, SECONDARY_PAGINATION_OPTIONS } from 'forpdi/src/consts';
import { parseSortedByToList } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';
import CompanyDomainStore from 'forpdi/src/forpdi/core/store/CompanyDomain';

class CompanyDomains extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companyDomains: null,
      page: 1,
      pageSize: SECONDARY_DEFAULT_PAGE_SIZE,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;
    const { toastr } = this.context;

    CompanyDomainStore.on('domain-removed', ({ data }) => {
      const { companyDomains } = this.state;
      const filteredDomains = _.filter(companyDomains, domain => domain.id !== data.id);
      this.setState({ companyDomains: filteredDomains });
      toastr.addAlertSuccess(Messages.get('notification.domain.delete'));
    }, this);

    CompanyDomainStore.on('domains-listed', ({ data, total }) => {
      this.setState({
        companyDomains: data,
        total,
      });
    }, this);

    this.findDomains(1, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    CompanyDomainStore.off(null, null, this);
  }

  findDomains = (page, pageSize, searchTerm, sortedBy) => {
    this.setState({
      page,
      pageSize,
      sortedBy,
      companyDomains: null,
      total: null,
    });
    CompanyDomainStore.dispatch({
      action: CompanyDomainStore.ACTION_LIST_DOMAINS,
      data: {
        term: searchTerm,
        page,
        pageSize,
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;

    this.findDomains(page, pageSize, searchTerm, sortedBy);
    this.setState({
      companyDomains: null,
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
    this.findDomains(1, pageSize, searchTerm, newSortedBy);
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
          <SecondaryTitle>{Messages.get('label.domains')}</SecondaryTitle>
          <PrimaryButton
            text={Messages.get('label.newDomain')}
            title={Messages.get('label.newDomain')}
            onClick={() => router.push('/system/domains/new')}
            loading={waitingSubmit}
          />
        </div>
        <SearchBox
          value={searchTerm}
          placeholder={Messages.get('label.search')}
          onChange={this.onSearchTermChange}
          onSubmit={(term) => {
            this.findDomains(1, pageSize, term, []);
          }}
        />
      </TabbedPanel.TopContainer>
    );
  }

  renderMainContent() {
    const {
      companyDomains,
      page,
      pageSize,
      sortedBy,
      total,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel.MainContainer>
          {
            companyDomains
              ? (
                <CompanyDomainTable
                  companyDomains={companyDomains}
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

CompanyDomains.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

export default CompanyDomains;
