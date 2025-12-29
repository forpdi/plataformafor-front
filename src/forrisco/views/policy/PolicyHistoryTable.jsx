import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import { parseSortedByToList } from 'forpdi/src/utils/util';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';

class PolicyHistoryTable extends React.Component {
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
    PolicyStore.on('policyHistoryRetrieved', this.onData, this);
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { policyId, refreshKey } = this.props;
    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;
    const {
      page: prevPage,
      pageSize: prevPageSize,
      actualSearchTerm: prevActual,
      sortedBy: prevSorted,
    } = prevState;

    if (policyId !== prevProps.policyId || refreshKey !== prevProps.refreshKey) {
      this.fetch(true);
      return;
    }

    if (
      page !== prevPage
      || pageSize !== prevPageSize
      || actualSearchTerm !== prevActual
      || sortedBy !== prevSorted
    ) {
      this.query(page, pageSize, actualSearchTerm, sortedBy);
    }
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  onData = (model) => {
    const {
      data = [], total = 0, page = 1, pageSize = 10,
    } = model || {};
    this.setState({
      rows: data,
      total,
      page,
      pageSize,
      loading: false,
    });
  };

  fetch = (resetPage = false) => {
    const { policyId } = this.props;
    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;

    if (!policyId) {
      this.setState({ rows: null, loading: true });
      return;
    }

    const pageToUse = resetPage ? 1 : page;
    this.query(pageToUse, pageSize, resetPage ? '' : actualSearchTerm, sortedBy);
  };

  query = (page, pageSize, actualSearchTerm, sortedBy) => {
    const { policyId } = this.props;
    if (!policyId) return;

    this.setState({ loading: true });

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_HISTORY,
      data: {
        policyId,
        page,
        pageSize,
        term: (actualSearchTerm || '').trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  };

  onSort = (sortedBy) => {
    this.setState({ sortedBy });
  };

  onSearchSubmit = () => {
    this.setState(prevState => ({
      page: 1,
      actualSearchTerm: prevState.searchTerm,
    }));
  };

  onPageChange = (page, pageSize) => {
    this.setState({ page, pageSize });
  };

  render() {
    const {
      rows,
      total,
      page,
      pageSize,
      sortedBy,
      searchTerm,
      loading,
    } = this.state;

    if (rows == null || loading) {
      return <LoadingGauge />;
    }

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

    return (
      <div>
        <SearchBox
          value={searchTerm}
          placeholder="Pesquisar"
          onChange={value => this.setState({ searchTerm: value })}
          onSubmit={this.onSearchSubmit}
          style={{ marginBottom: '16px' }}
        />

        <Table
          data={rows}
          columns={columns}
          onSort={this.onSort}
          sortedBy={sortedBy}
          emptyMessage="Não há registros de alterações."
        />

        <Pagination
          total={total}
          onChange={this.onPageChange}
          page={page}
          pageSize={pageSize}
        />
      </div>
    );
  }
}

PolicyHistoryTable.propTypes = {
  policyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  refreshKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

PolicyHistoryTable.defaultProps = {
  refreshKey: 0,
};

export default PolicyHistoryTable;
