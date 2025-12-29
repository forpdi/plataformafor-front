import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import ItemTable from 'forpdi/src/forrisco/components/item/ItemTable';
import ItemNestedRow from 'forpdi/src/forrisco/components/item/ItemNestedRow';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import IconButton from 'forpdi/src/components/buttons/IconButton';

import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';
import Messages from 'forpdi/src/Messages';
import { exportItemsReport } from 'forpdi/src/forrisco/helpers/exportReportHelper';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import { parseSortedByToList } from 'forpdi/src/utils/util';

const itemsNestingLevel = 1;

class PlanRiskItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const { toastr } = this.context;
    const { pageSize, searchTerm, sortedBy } = this.state;

    PlanRiskItemStore.on('allItems', (response) => {
      this.setState({
        items: response.data,
        total: response.total,
      });
    }, this);

    PlanRiskItemStore.on('deletePlanRiskItem', ({ data }) => {
      const { items, total } = this.state;
      const updateditems = _.filter(items, ({ id }) => data.id !== id);

      toastr.addAlertSuccess(Messages.get('label.notification.item.delete'));
      this.setState({ items: updateditems, total: total - 1 });
    }, this);

    PlanRiskItemStore.on('deletePlanRiskSubItem', ({ data }) => {
      const { id: itemId } = data.planRiskItem;
      const { items } = this.state;
      const item = _.find(items, ({ id }) => id === itemId);
      const updatedSubitems = _.filter(item.subitems, ({ id }) => data.id !== id);
      item.subitems = updatedSubitems;

      this.setState({ items });

      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
    }, this);

    this.findItems(1, pageSize, searchTerm, sortedBy);
  }

  findItems = (page, pageSize, searchTerm, sortedBy) => {
    const { params } = this.props;
    const { planRiskId } = params;

    this.setState({
      page,
      pageSize,
      sortedBy,
      items: null,
      total: null,
    });

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_GET_ALL_ITEMS,
      data: {
        planRiskId,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  componentWillUnmount() {
    PlanRiskItemStore.off(null, null, this);
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findItems(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  onHandleRedirect = (data) => {
    const { router } = this.context;
    const { params } = this.props;
    const { planRiskId } = params;
    router.push(`/forrisco/plan-risk/${planRiskId}/item/${data.id}/info`);
  }

  onHandleRedirectSubitem = (data) => {
    const { router } = this.context;
    const { params } = this.props;
    const { planRiskId } = params;
    const { id: subItemId } = data;
    router.push(`/forrisco/plan-risk/${planRiskId}/item/${data.id}/subitem/${subItemId}/info`);
  }

  onNewItem = () => {
    const { params } = this.props;
    const { router } = this.context;
    const { planRiskId } = params;

    router.push(`forrisco/plan-risk/${planRiskId}/item/new`);
  }

  onEdit = (item) => {
    const hasParentItem = item.itemId;
    const { router } = this.context;
    const { id: itemId } = item;

    hasParentItem
      ? router.push(`forrisco/plan-risk/subitem/${itemId}/edit`)
      : router.push(`forrisco/plan-risk/item/${itemId}/edit`);
  }

  onDelete = (item) => {
    const hasParentItem = item.itemId;

    PlanRiskItemStore.dispatch({
      action: hasParentItem
        ? PlanRiskItemStore.ACTION_DELETE_SUBITEM
        : PlanRiskItemStore.ACTION_DELETE_ITEM,
      data: item.id,
    });
  }

  onNewSubitem = (parentItemId) => {
    const { router } = this.context;
    const { params } = this.props;
    const { planRiskId } = params;

    router.push(`forrisco/plan-risk/${planRiskId}/item/${parentItemId}/subitem/new`);
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
    this.findItems(1, pageSize, searchTerm, newSortedBy);
  }

  showExportReportModal = () => {
    const { params } = this.props;
    const { planRiskId } = params;
    const { items } = this.state;

    exportItemsReport(items, `${PlanRiskStore.url}/exportReport?planId=${planRiskId}`);
  }

  nestedComponentRender = (props) => {
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { id: itemId } = props;
    const { items } = this.state;
    const { subitems } = _.find(items, ({ id }) => id === itemId);
    return (
      <ItemNestedRow
        {...props}
        onDelete={this.onDelete}
        onNewSubitem={this.onNewSubitem}
        subitems={subitems}
        onEdit={this.onEdit}
        onRedirect={this.onHandleRedirectSubitem}
        hasPermission={hasForriscoManagePlanRiskPermission}
      />
    );
  }

  render() {
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const {
      items,
      page,
      pageSize,
      total,
      searchTerm,
      sortedBy,
    } = this.state;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.items')}</SecondaryTitle>
            <div>
              <IconButton
                title={Messages.get('label.exportReport')}
                icon="download"
                onClick={this.showExportReportModal}
              />
              {
                hasForriscoManagePlanRiskPermission && (
                  <PrimaryButton
                    text={Messages.get('label.itemRiskRegister')}
                    title={Messages.get('label.itemRiskRegister')}
                    onClick={this.onNewItem}
                    style={{ marginLeft: '15px' }}
                  />
                )
              }
            </div>
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findItems(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <ItemTable
            items={items}
            nestedComponentRender={this.nestedComponentRender}
            onRedirect={this.onHandleRedirect}
            onDelete={this.onDelete}
            onEdit={this.onEdit}
            onSort={this.onSort}
            sortedBy={sortedBy}
            nestingLevel={itemsNestingLevel}
            hasPermission={hasForriscoManagePlanRiskPermission}
          />
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

PlanRiskItems.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskItems.propTypes = {
  params: PropTypes.shape({}),
};

PlanRiskItems.defaultProps = {
  params: {},
};

export default PlanRiskItems;
