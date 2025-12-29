import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import Table from 'forpdi/src/components/Table';
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton';

import { parseSortedByToList } from 'forpdi/src/utils/util';
import { buildLevelUrl, buildRiskUrl } from 'forpdi/src/utils/urlUtil';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import Messages from 'forpdi/src/Messages';

class UserAssociations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      associationsFPDI: null,
      associationsFRISCO: null,
      selectedForpdiAssociations: true,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      sortedBy: null,
      total: null,
    };
  }

  componentDidMount() {
    RiskStore.on('riskByLevel', (response) => {
      const { data, total } = response;
      this.setState({ associationsFRISCO: data, total });
    }, this);

    StructureStore.on('userlevelsretrivied', (response) => {
      const { data, total } = response;
      this.setState({ associationsFPDI: data, total });
    }, this);

    this.findAssociations();
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
    RiskStore.off(null, null, this);
    StructureStore.off(null, null, this);
  }

  setFpdi = () => {
    this.setState({
      selectedForpdiAssociations: true,
    }, () => {
      this.setState({ sortedBy: null });
      this.pageChange(1, Pagination.defaultPageSize);
    });
  }

  setFrisco = () => {
    this.setState({
      selectedForpdiAssociations: false,
    }, () => {
      this.setState({ sortedBy: null });
      this.pageChange(1, Pagination.defaultPageSize);
    });
  }

  pageChange = (page, pageSize) => {
    const { selectedForpdiAssociations } = this.state;
    const association = selectedForpdiAssociations ? 'associationsFPDI' : 'associationsFRISCO';
    this.setState({
      page,
      pageSize,
      [association]: null,
    }, this.findAssociations);
  }

  findAssociations() {
    const { params } = this.props;
    const {
      selectedForpdiAssociations,
      page,
      pageSize,
      sortedBy,
    } = this.state;
    const userId = params.userId || UserSession.get('user').id;

    const parsedSortedBy = parseSortedByToList(sortedBy);
    if (selectedForpdiAssociations) {
      StructureStore.dispatch({
        action: StructureStore.ACTION_GET_USER_LEVELS,
        data: {
          userId,
          page,
          pageSize,
          sortedBy: parsedSortedBy,
        },
      });
    } else {
      RiskStore.dispatch({
        action: RiskStore.ACTION_LIST_RISKS_BY_USER,
        data: {
          userId,
          page,
          pageSize,
          sortedBy: parsedSortedBy,
        },
      });
    }
  }

  getCurrentAssociations() {
    const { selectedForpdiAssociations, associationsFPDI, associationsFRISCO } = this.state;
    if (selectedForpdiAssociations) {
      return associationsFPDI;
    }
    return associationsFRISCO;
  }

  isLoading() {
    const { selectedForpdiAssociations, associationsFPDI, associationsFRISCO } = this.state;

    if (selectedForpdiAssociations) {
      return !associationsFPDI;
    }

    return !associationsFRISCO;
  }

  renderCurrentAssociations() {
    const { selectedForpdiAssociations, sortedBy } = this.state;

    const onRedirect = (data) => {
      const { router } = this.context;
      if (selectedForpdiAssociations) {
        const { plan } = data;
        const { parent } = plan;
        router.push(buildLevelUrl(parent.id, data.id));
      } else {
        router.push(buildRiskUrl(data.id));
      }
    };

    const renderLevel = (data) => {
      if (selectedForpdiAssociations) {
        const { level } = data;
        const { name } = level;
        return <span>{name}</span>;
      }
      const { type } = data;
      return <span>{type}</span>;
    };

    const renderName = (data) => {
      const { name } = data;
      return <span>{name}</span>;
    };

    const onSort = (newSortedBy) => {
      this.setState({
        page: 1,
        sortedBy: newSortedBy,
        associationsFPDI: null,
        associationsFRISCO: null,
      }, this.findAssociations);
    };

    const columns = [
      {
        name: selectedForpdiAssociations
          ? Messages.get('label.level')
          : Messages.get('label.typeLegend'),
        field: selectedForpdiAssociations
          ? 'level.name'
          : 'type',
        render: renderLevel,
        width: '50%',
        sort: true,
      },
      {
        name: Messages.get('label.name'),
        field: `${selectedForpdiAssociations ? 'levelInstance.' : ''}name`,
        render: renderName,
        width: '50%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'eye',
        title: Messages.get('label.view'),
        action: onRedirect,
      },
    ];

    return (
      <Table
        data={this.getCurrentAssociations()}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={actionColumnItems}
        noTableNested
      />
    );
  }

  render() {
    const {
      page,
      pageSize,
      total,
      selectedForpdiAssociations,
    } = this.state;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.userAssociations')}</SecondaryTitle>
          <div>
            <AppStyledButton
              text={Messages.get('label.forPdiBrand')}
              title={Messages.get('label.forPdiBrand')}
              onClick={this.setFpdi}
              appName="fpdi"
              style={{ marginRight: '10px', backgroundColor: 'none' }}
              disabled={selectedForpdiAssociations}
            />
            <AppStyledButton
              text={Messages.get('label.forRiscoBrand')}
              title={Messages.get('label.forRiscoBrand')}
              onClick={this.setFrisco}
              appName="frisco"
              style={{ backgroundColor: 'none' }}
              disabled={!selectedForpdiAssociations}
            />
          </div>
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {this.isLoading()
            ? <LoadingGauge />
            : this.renderCurrentAssociations()}
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

UserAssociations.contextTypes = {
  theme: PropTypes.string.isRequired,
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

UserAssociations.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string,
  }),
};

UserAssociations.defaultProps = {
  params: null,
};

export default UserAssociations;
