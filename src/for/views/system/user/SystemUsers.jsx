import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import SystemUsersTable from 'forpdi/src/for/components/user/SystemUsersTable';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';

import { SECONDARY_DEFAULT_PAGE_SIZE, SECONDARY_PAGINATION_OPTIONS } from 'forpdi/src/consts';
import { parseSortedByToList } from 'forpdi/src/utils/util';
import UserStore from 'forpdi/src/forpdi/core/store/User';
import Messages from 'forpdi/src/Messages';

class SystemUsers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
      page: 1,
      pageSize: SECONDARY_DEFAULT_PAGE_SIZE,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const {
      page,
      pageSize,
      searchTerm,
      sortedBy,
    } = this.state;

    UserStore.on('users-filteredlist', ({ data, total }) => {
      this.setState({
        users: data,
        total,
      });
    });

    this.findUsers(page, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
  }

  findUsers(page, pageSize, searchTerm, sortedBy) {
    this.setState({
      page,
      pageSize,
      sortedBy,
      users: null,
      total: null,
    });
    UserStore.dispatch({
      action: UserStore.ACTION_LIST_FILTERED_USERS,
      data: {
        page,
        pageSize,
        term: searchTerm,
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;

    this.findUsers(page, pageSize, searchTerm, sortedBy);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
    } = this.state;
    this.findUsers(1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const {
      users,
      page,
      pageSize,
      total,
      searchTerm,
      sortedBy,
    } = this.state;

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <SecondaryTitle>{Messages.get('label.systemUsers')}</SecondaryTitle>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findUsers(1, pageSize, term, [])}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {
            users ? (
              <SystemUsersTable
                users={users}
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
      </div>
    );
  }
}

SystemUsers.contextTypes = {
  theme: PropTypes.string.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default SystemUsers;
