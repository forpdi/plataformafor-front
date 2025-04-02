import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Collapse } from 'react-collapse';

import IconButton from 'forpdi/src/components/buttons/IconButton';
import Text from 'forpdi/src/components/typography/Text';

import { parseDateTime } from 'forpdi/src/utils/dateUtil';
import Messages from 'forpdi/src/Messages';

const nestingPadding = 20;
const [asc, desc] = ['asc', 'desc'];
const [def, up, down] = ['sort', 'sort-down', 'sort-up'];

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.toggleNestedRow = this.toggleNestedRow.bind(this);

    const { data } = props;
    this.state = {
      expandedNestedRowsIds: [],
      data,
      sortedBy: props.sortedBy,
      tableIsLargerThanParent: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const { data } = this.props;

    if (!_.isEqual(data, newProps.data)) {
      this.setState({
        data: newProps.data,
      });
    }
  }

  componentDidMount() {
    const { defaultExpandedRowId } = this.props;
    if (defaultExpandedRowId) {
      this.toggleNestedRow(defaultExpandedRowId);
    }

    this.resizeEvent = window.addEventListener('resize', () => {
      this.checkTableWidth();
    });

    this.checkTableWidth();
  }

  checkTableWidth() {
    if (this.tableRef) {
      const { parentElement } = this.tableRef.parentElement;
      const parentStyle = getComputedStyle(parentElement, null);
      const padding = parentStyle ? parentStyle.getPropertyValue('padding-left') : '0';
      const paddingInt = parseInt(padding.replace('px', ''), 10);
      const tableWidth = this.tableRef.clientWidth;
      const parentWidth = parentElement.clientWidth - 2 * paddingInt;
      this.setState({
        tableIsLargerThanParent: tableWidth > parentWidth,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeEvent);
  }

  renderHead() {
    const {
      columns,
      actionColumnItems,
      renderActionColumnHeader,
      stickyTopHead,
    } = this.props;

    const { theme } = this.context;

    const { tableIsLargerThanParent } = this.state;

    return (
      <thead style={{
        top: stickyTopHead,
        position: tableIsLargerThanParent || stickyTopHead === null ? 'static' : 'sticky',
      }}
      >
        <tr>
          {
            _.map(columns, ({
              name, sort, field, renderHead,
            }, index) => (
              <th
                key={`col-${index}`}
                style={{
                  whiteSpace: 'nowrap',
                  paddingLeft: this.getLeftPadding(),
                }}
                className={`${theme}-text-color`}
              >
                {renderHead ? renderHead(name) : name}
                {sort && (
                  <IconButton
                    title={`${Messages.get('label.orderBy')}`}
                    icon={this.getSortButtonIcon(field)}
                    onClick={() => this.onSort(field, sort)}
                    style={{ margin: '0 10px' }}
                  />
                )}
              </th>
            ))
          }
          {
            actionColumnItems && (
              <th className={`${theme}-text-color`}>
                {renderActionColumnHeader ? renderActionColumnHeader() : Messages.get('label.actions')}
              </th>
            )
          }
        </tr>
      </thead>
    );
  }

  getSortButtonIcon(field) {
    const { sortedBy } = this.state;

    if (!sortedBy) return def;

    const { field: sortField, order } = sortedBy;

    if (sortField === field) {
      return order === asc ? down : up;
    }

    return def;
  }

  onSort = (field, sort) => {
    const { onSort } = this.props;
    const sortedBy = this.getNewSortedBy(field);
    if (onSort) {
      onSort(sortedBy);
    } else {
      let sortedData;
      const { data } = this.state;
      if (typeof sort === 'function') {
        sortedData = sort(data);
      } else {
        sortedData = _.sortBy(data, elem => `${elem[field]}`.toLocaleLowerCase());
      }

      const { order } = sortedBy;

      if (order === desc) {
        sortedData.reverse();
      }

      this.setState({
        data: sortedData,
        expandedNestedRowsIds: [],
        sortedBy,
      });
    }
  }

  getNewSortedBy(field) {
    const ascSort = { field, order: asc };
    const { sortedBy } = this.state;

    if (!sortedBy) return ascSort;

    const { order, field: sortField } = sortedBy;

    if (order !== asc || field !== sortField) {
      return ascSort;
    }

    return { field, order: desc };
  }

  renderBody() {
    const { data } = this.state;

    if (data.length === 0) {
      return (
        <tbody className="page-disabled">
          {this.renderEmptyDataMessage()}
        </tbody>
      );
    }

    return (
      <tbody>
        {
          _.map(data, (rowData) => {
            const rows = [];
            const { id } = rowData;
            rows.push(this.getRow(rowData));
            rows.push(this.getNestedRow(id));

            return rows;
          })
        }
      </tbody>
    );
  }

  renderEmptyDataMessage() {
    const { messageToEmptyData } = this.props;

    return (
      <tr>
        <td colSpan={this.getNumOfColumns()} style={{ textAlign: 'center' }}>
          <Text>
            {messageToEmptyData}
          </Text>
        </td>
      </tr>
    );
  }

  getRow(rowData) {
    const {
      redirect,
      columns,
      actionColumnItems,
    } = this.props;
    const { theme } = this.context;

    return (
      <tr
        key={`row-${rowData.id}`}
        id={Table.getRowId(rowData.id)}
        onClick={redirect ? () => redirect(rowData) : null}
        style={{ cursor: redirect ? 'pointer' : 'default' }}
      >
        {
          _.map(columns, ({
            field,
            render,
            width,
            minWidth,
            maxWidth,
          }, index) => (
            <td
              key={`col-${index}`}
              className={`${theme}-text-color`}
              style={{
                width,
                minWidth,
                maxWidth,
                paddingLeft: this.getLeftPadding(),
              }}
            >
              {render ? render(rowData) : rowData[field]}
            </td>
          ))
        }
        {actionColumnItems && this.renderActionsColumn(rowData)}
      </tr>
    );
  }

  getLeftPadding() {
    const { nestingLevel } = this.props;

    return `${nestingLevel * nestingPadding}px`;
  }

  getNestedRow(id) {
    const { nestedComponentRender } = this.props;
    if (!nestedComponentRender) {
      return null;
    }
    return (
      <tr key={`nested-row-${id}`} className="custom-table-nested__row">
        <td style={{ padding: 0 }} colSpan={this.getNumOfColumns()}>
          <Collapse
            isOpened={this.shouldRenderNestedRow(id)}

          >
            {nestedComponentRender({ id })}
          </Collapse>
        </td>
      </tr>
    );
  }

  getNumOfColumns() {
    const { actionColumnItems, columns } = this.props;

    return columns.length + (actionColumnItems ? 1 : 0);
  }

  shouldRenderNestedRow(id) {
    return this.nestedRowIsExpanded(id)
      && this.nestedRowDataLoaded(id);
  }

  renderActionsColumn(rowData) {
    const { actionColumnItems } = this.props;
    const { id } = rowData;

    const { length } = actionColumnItems;
    const width = `${length * 45 - 15}px`;
    const tdStyle = {
      minWidth: width,
      maxWidth: width,
      boxSizing: 'content-box',
      textAlign: 'left',
    };

    return (
      <td style={tdStyle}>
        {
          _.map(actionColumnItems, ({
            icon,
            title,
            action,
            expandNestedRow,
            disabled,
          }, idx) => {
            const buttonIsDisabled = (typeof disabled === 'function')
              ? disabled(rowData)
              : disabled;
            const definedIcon = (typeof icon === 'function')
              ? icon(rowData)
              : icon;
            const definedTitle = (typeof title === 'function')
              ? title(rowData)
              : title;

            return (
              !buttonIsDisabled && (
                <IconButton
                  key={`action-${idx}`}
                  icon={this.getActionColumnIcon(expandNestedRow, definedIcon, id)}
                  loading={expandNestedRow && this.nestedRowIsLoading(id)}
                  title={definedTitle}
                  style={{ marginRight: idx < length - 1 ? '15px' : '0' }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (expandNestedRow) {
                      this.toggleNestedRow(id);
                    } else if (action) {
                      action(rowData);
                    }
                  }}
                />
              )
            );
          })
        }
      </td>
    );
  }

  getActionColumnIcon(expandNestedRow, icon, id) {
    if (expandNestedRow) {
      return this.nestedRowIsExpanded(id) ? 'chevron-down' : 'chevron-right';
    }

    return icon;
  }

  nestedRowIsLoading(id) {
    return this.nestedRowIsExpanded(id)
      && !this.nestedRowDataLoaded(id);
  }

  nestedRowDataLoaded(id) {
    const { loadedNestedRowIds } = this.props;

    return !loadedNestedRowIds || loadedNestedRowIds.includes(id);
  }

  toggleNestedRow(id) {
    const { expandedNestedRowsIds } = this.state;
    const { onToggleNestedRow, loadedNestedRowIds } = this.props;

    if (this.nestedRowIsExpanded(id)) {
      this.setState({
        expandedNestedRowsIds: _.filter(expandedNestedRowsIds, rowId => rowId !== id),
      });
    } else {
      this.setState({
        expandedNestedRowsIds: [...expandedNestedRowsIds, id],
      });
    }

    const nextLoadedNestedRowIds = loadedNestedRowIds ? [...loadedNestedRowIds] : [];
    if (!nextLoadedNestedRowIds.includes(id)) {
      nextLoadedNestedRowIds.push(id);
    }

    onToggleNestedRow && onToggleNestedRow(nextLoadedNestedRowIds, id);
  }

  nestedRowIsExpanded(id) {
    const { expandedNestedRowsIds } = this.state;

    return expandedNestedRowsIds.includes(id);
  }

  render() {
    const {
      showHeader,
      className,
      style,
      nestingLevel,
    } = this.props;
    const { theme } = this.context;

    const { tableIsLargerThanParent } = this.state;

    const nestedClass = nestingLevel > 1 ? 'custom-table-nested' : '';

    return (
      <div
        className="custom-scrollbar"
        style={{ overflowX: tableIsLargerThanParent ? 'auto' : 'unset' }}
      >
        <table
          className={`custom-table ${theme}-table ${nestedClass} ${className}`}
          style={style}
          ref={(e) => { this.tableRef = e; }}
        >
          {showHeader && this.renderHead()}
          {this.renderBody()}
        </table>
      </div>
    );
  }
}

Table.getRowId = rowId => `row-${rowId}`;

Table.getNumberSortBy = fieldName => (
  data => _.sortBy(data, elem => (elem[fieldName] ? parseInt(elem[fieldName], 10) : null))
);

Table.getDateSortBy = fieldName => (
  data => _.sortBy(data, elem => (elem[fieldName] ? parseDateTime(elem[fieldName]) : null))
);

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    field: PropTypes.string,
    width: PropTypes.string,
    minWidth: PropTypes.string,
    maxWidth: PropTypes.string,
    render: PropTypes.func,
    renderHead: PropTypes.func,
    sort: PropTypes.oneOfType([
      PropTypes.func, PropTypes.bool,
    ]),
  })),
  actionColumnItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
      ]),
      action: PropTypes.func,
      expandNestedRow: PropTypes.bool,
    }),
  ),
  renderActionColumnHeader: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })),
  loadedNestedRowIds: PropTypes.arrayOf(PropTypes.number),
  onToggleNestedRow: PropTypes.func,
  showHeader: PropTypes.bool,
  nestedComponentRender: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  redirect: PropTypes.func,
  nestingLevel: PropTypes.number,
  defaultExpandedRowId: PropTypes.number,
  stickyTopHead: PropTypes.number,
  messageToEmptyData: PropTypes.string,
  onSort: PropTypes.func,
  sortedBy: PropTypes.shape({
    field: PropTypes.string,
    order: PropTypes.string,
  }),
};

Table.defaultProps = {
  columns: [],
  actionColumnItems: null,
  renderActionColumnHeader: null,
  data: [],
  loadedNestedRowIds: null,
  onToggleNestedRow: null,
  showHeader: true,
  nestedComponentRender: null,
  className: '',
  style: null,
  redirect: null,
  nestingLevel: 1,
  defaultExpandedRowId: null,
  stickyTopHead: 0,
  messageToEmptyData: Messages.get('label.noRecords'),
  onSort: null,
  sortedBy: null,
};

Table.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default Table;
