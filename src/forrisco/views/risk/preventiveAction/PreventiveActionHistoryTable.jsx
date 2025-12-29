// forrisco/views/risk/preventiveAction/PreventiveActionHistoryTable.jsx
import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Messages from 'forpdi/src/Messages';
import { parseSortedByToList } from 'forpdi/src/utils/util';

import PreventiveActionHistoryStore from 'forpdi/src/forrisco/stores/PreventiveActionHistoryStore';

class PreventiveActionHistoryTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      total: 0,
      page: 1,
      pageSize: 10,
      searchTerm: '',
      actualSearchTerm: '',
      sortedBy: [],
      loading: false,
    };
  }

  componentDidMount() {
    PreventiveActionHistoryStore.on('preventive-action-history-retrieved', this.onData, this);
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { actionId } = this.props;
    if (prevProps.actionId !== actionId) {
      this.fetch();
      return;
    }

    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;
    if (
      prevState.page !== page
      || prevState.pageSize !== pageSize
      || prevState.actualSearchTerm !== actualSearchTerm
      || prevState.sortedBy !== sortedBy
    ) {
      this.query(page, pageSize, actualSearchTerm, sortedBy);
    }
  }

  componentWillUnmount() {
    PreventiveActionHistoryStore.off(null, null, this);
  }

  onData = (model) => {
    const {
      data = [], total = 0, page = 1, pageSize = 10,
    } = model || {};
    this.setState(
      {
        rows: data, total, page, pageSize, loading: false,
      },
    );
  };

  fetch = () => {
    const { actionId } = this.props;
    if (!actionId) {
      this.setState({ rows: null, loading: true });
      return;
    }
    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;
    this.query(page, pageSize, actualSearchTerm, sortedBy);
  };

  query = (page, pageSize, actualSearchTerm, sortedBy) => {
    const { actionId } = this.props;
    if (!actionId) return;

    this.setState({ loading: true });

    PreventiveActionHistoryStore.dispatch({
      action: PreventiveActionHistoryStore.ACTION_FIND,
      data: {
        actionId,
        page,
        pageSize,
        term: (actualSearchTerm || '').trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  };

  onSort = sortedBy => this.setState({ sortedBy, page: 1 });

  onSearch = () => this.setState(prev => ({ page: 1, actualSearchTerm: prev.searchTerm }));

  onPageChange = (page, pageSize) => this.setState({ page, pageSize });

  render() {
    const {
      rows, total, page, pageSize, sortedBy, searchTerm, loading,
    } = this.state;

    const columns = [
      {
        name: 'Responsável alteração', field: 'responsibleUser', width: '20%', sort: true,
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

    if (rows == null || loading) return <LoadingGauge />;

    return (
      <div>
        <SearchBox
          value={searchTerm}
          placeholder={Messages.get('label.search')}
          onChange={value => this.setState({ searchTerm: value })}
          onSubmit={this.onSearch}
        />
        <Table
          data={rows}
          columns={columns}
          onSort={this.onSort}
          sortedBy={sortedBy}
          emptyMessage="Não há registros de alterações."
        />
        <Pagination total={total} onChange={this.onPageChange} page={page} pageSize={pageSize} />
      </div>
    );
  }
}

PreventiveActionHistoryTable.propTypes = {
  actionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default PreventiveActionHistoryTable;
