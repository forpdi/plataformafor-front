import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import MessagesTable from 'forpdi/src/for/components/user/MessagesTable';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import { parseSortedByToList } from 'forpdi/src/utils/util';
import Messages from 'forpdi/src/Messages';

class UserMessages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      sortedBy: null,
      total: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { userId } = params;
    const { page, pageSize, sortedBy } = this.state;

    UserSession.on('retrieve-messages', (response) => {
      const { data, total } = response;
      this.setState({ messages: data, total });
    }, this);

    this.findMessages(page, pageSize, userId, sortedBy);
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  pageChange = (page, pageSize) => {
    const { sortedBy } = this.state;
    const { params } = this.props;
    const { userId } = params;

    this.setState({
      page,
      pageSize,
      messages: null,
    }, () => this.findMessages(page, pageSize, userId, sortedBy));
  }

  findMessages(page, pageSize, userId, sortedBy) {
    this.setState({
      page,
      pageSize,
      sortedBy,
      messages: null,
      total: null,
    });
    UserSession.dispatch({
      action: UserSession.ACTION_LIST_MESSAGES,
      data: {
        userId,
        page,
        pageSize,
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  onSort = (newSortedBy) => {
    const { params } = this.props;
    const { userId } = params;
    const { pageSize } = this.state;
    this.findMessages(1, pageSize, userId, newSortedBy);
  }

  render() {
    const {
      messages,
      page,
      pageSize,
      sortedBy,
      total,
    } = this.state;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.messageHistory')}</SecondaryTitle>
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {
            messages ? (
              <MessagesTable
                messages={messages}
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
        />
      </div>
    );
  }
}

UserMessages.contextTypes = {
  theme: PropTypes.string.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

UserMessages.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string,
  }),
};

UserMessages.defaultProps = {
  params: null,
};

export default UserMessages;
