import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import Messages from 'forpdi/src/Messages';
import HistoryStore from 'forpdi/src/forrisco/stores/History';
import { parseSortedByToList } from 'forpdi/src/utils/util';

class HistoryTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyData: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: 0,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    HistoryStore.on('history-retrieved', (response) => {
      this.setState({
        historyData: response.data,
        total: response.total,
      });
    }, this);

    const {
      page, pageSize, searchTerm, sortedBy,
    } = this.state;
    this.findHistory(page, pageSize, searchTerm, sortedBy);
  }

  componentWillUnmount() {
    HistoryStore.off(null, null, this);
  }

  onSort = (newSortedBy) => {
    const { page, pageSize, searchTerm } = this.state;
    this.findHistory(page, pageSize, searchTerm, newSortedBy);
  };

  onSearch = () => {
    const { pageSize, sortedBy, searchTerm } = this.state;
    this.findHistory(1, pageSize, searchTerm, sortedBy);
  };

  findHistory = (page, pageSize, searchTerm, sortedBy) => {
    const { entityId, entityName } = this.props;

    this.setState({
      page,
      pageSize,
      searchTerm,
      sortedBy,
      historyData: null,
    });

    HistoryStore.dispatch({
      action: HistoryStore.ACTION_FIND,
      data: {
        entityId,
        entityName,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  };

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findHistory(page, pageSize, searchTerm, sortedBy);
  };

  render() {
    const {
      historyData, page, pageSize, total, sortedBy, searchTerm,
    } = this.state;

    if (!historyData) {
      return <LoadingGauge />;
    }

    const columns = [
      {
        name: 'Responsável alteração',
        field: 'responsibleUserName',
        width: '20%',
        sort: true,
        render: row => row.responsibleUserName || row.responsibleUser || '',
      },
      {
        name: 'Campo alterado', field: 'changedField', width: '20%', sort: true,
      },
      {
        name: 'Dado antigo', field: 'oldValue', width: '25%', sort: true,
      },
      {
        name: 'Dado novo', field: 'newValue', width: '25%', sort: true,
      },
      {
        name: 'Data alteração', field: 'changeDate', width: '10%', sort: true,
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
          {Messages.get('label.research')}
        </div>
        <SearchBox
          value={searchTerm}
          style={{ marginBottom: '24px' }}
          placeholder={Messages.get('label.search')}
          onChange={value => this.setState({ searchTerm: value })}
          onSubmit={this.onSearch}
        />
        <Table
          data={historyData}
          columns={columns}
          onSort={this.onSort}
          sortedBy={sortedBy}
          emptyMessage="Não há registros de alterações."
        />
        <Pagination total={total} onChange={this.pageChange} page={page} pageSize={pageSize} />
      </div>
    );
  }
}

HistoryTable.propTypes = {
  entityId: PropTypes.number.isRequired,
  // eslint-disable-next-line react/require-default-props
  entityName: PropTypes.oneOf(['Unit', 'Risk', 'Monitoring']),
};

export default HistoryTable;
