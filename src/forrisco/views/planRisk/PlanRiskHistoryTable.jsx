import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import { parseSortedByToList } from 'forpdi/src/utils/util';

import PlanRiskHistoryStore from 'forpdi/src/forrisco/stores/PlanRiskHistoryStore';

/**
 * Histórico do Plano de Riscos
 * Padrão 1:1 com o histórico da Unidade (busca, ordenação, paginação).
 */
class PlanRiskHistoryTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      total: 0,
      page: 1,
      pageSize: 10,
      // termo de pesquisa
      searchTerm: '',
      // termo de pesquisa que realmente será usado na busca (após o debounce)
      actualSearchTerm: '',
      sortedBy: [],
      loading: false,
    };
  }

  componentDidMount() {
    PlanRiskHistoryStore.on('planrisk-history-retrieved', this.onData, this);
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const prevId = prevProps.planRiskId || prevProps.entityId;
    const currId = this.getId();

    if (prevId !== currId) {
      this.fetch();
      return;
    }

    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;
    const {
      page: prevPage,
      pageSize: prevPageSize,
      actualSearchTerm: prevActualSearch,
      sortedBy: prevSorted,
    } = prevState;

    if (
      prevPage !== page
      || prevPageSize !== pageSize
      || prevActualSearch !== actualSearchTerm
      || prevSorted !== sortedBy
    ) {
      this.query(page, pageSize, actualSearchTerm, sortedBy);
    }
  }

  componentWillUnmount() {
    PlanRiskHistoryStore.off(null, null, this);
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

  getId = () => {
    const { planRiskId, entityId } = this.props;
    return planRiskId || entityId;
  };

  fetch = () => {
    const id = this.getId();
    if (!id) {
      this.setState({ rows: null, loading: true });
      return;
    }
    const {
      page, pageSize, actualSearchTerm, sortedBy,
    } = this.state;
    this.query(page, pageSize, actualSearchTerm, sortedBy);
  };

  query = (page, pageSize, actualSearchTerm, sortedBy) => {
    const id = this.getId();
    if (!id) return;

    this.setState({ loading: true });

    PlanRiskHistoryStore.dispatch({
      action: PlanRiskHistoryStore.ACTION_FIND,
      data: {
        planRiskId: id,
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

PlanRiskHistoryTable.propTypes = {
  planRiskId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  entityId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PlanRiskHistoryTable.defaultProps = {
  planRiskId: null,
  entityId: null,
};

export default PlanRiskHistoryTable;
