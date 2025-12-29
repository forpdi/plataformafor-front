import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import SelectLinksBaseModal from 'forpdi/src/forrisco/components/risk/links/SelectLinksBaseModal';

import { MIN_PAGE_SIZE } from 'forpdi/src/consts';

const maxChecks = 10;

class SelectPdiLinksModal extends React.Component {
  constructor(props) {
    super(props);

    const { defaultCheckedValues } = props;

    this.state = {
      checkedValues: defaultCheckedValues,
      options: null,
      page: 1,
      pageSize: MIN_PAGE_SIZE,
      total: null,
      searchTerm: '',
    };
  }

  componentDidMount() {
    const { linksDisabled, triggerName } = this.props;
    const { checkedValues, pageSize, searchTerm } = this.state;

    StructureStore.on(triggerName, ({ data, total }) => {
      this.setState({
        options: data,
        total,
      });
    }, this);

    if (!linksDisabled) {
      this.findLinks(checkedValues, 1, pageSize, searchTerm);
    }
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  toggleCheck = (item) => {
    const {
      checkedValues,
      pageSize,
      searchTerm,
    } = this.state;
    const { id } = item;

    const isChecked = this.optionIsChecked(checkedValues, id);

    const updatedCheckList = isChecked
      ? _.filter(checkedValues, ({ id: checkedId }) => checkedId !== id)
      : [...checkedValues, item];

    if (updatedCheckList.length <= maxChecks || isChecked) {
      this.setState({ checkedValues: updatedCheckList, page: 1 });
      this.findLinks(updatedCheckList, 1, pageSize, searchTerm);
    }
  }

  optionIsChecked = (checkedValues, id) => _.map(checkedValues, value => value.id).includes(id);

  findLinks(checkedValues, page, pageSize, searchTerm) {
    const { action } = this.props;

    const selectedIds = _.map(checkedValues, ({ id }) => id);
    StructureStore.dispatch({
      action,
      data: {
        excludedIds: selectedIds,
        page,
        pageSize,
        term: searchTerm.trim(),
      },
      opts: { checkValuesIsEmpty: checkedValues.length === 0 },
    });
  }

  pageChange = (page, pageSize) => {
    const { checkedValues, searchTerm } = this.state;

    this.findLinks(checkedValues, page, pageSize, searchTerm);
    this.setState({
      page,
      pageSize,
    });
  }

  renderTable() {
    const { options, checkedValues } = this.state;

    const renderCheckBoxes = (item) => {
      const { id } = item;

      return (
        <CheckBox
          key={id}
          onChange={() => this.toggleCheck(item)}
          checked={this.optionIsChecked(checkedValues, id)}
        />
      );
    };

    const renderLabel = ({ name }) => <span>{name}</span>;

    const columns = [
      {
        field: 'checkbox',
        width: '5%',
        render: renderCheckBoxes,
      },
      {
        field: 'name',
        width: '95%',
        render: renderLabel,
      },
    ];

    return (
      <Table
        data={options}
        columns={columns}
        showHeader={false}
      />
    );
  }

  renderSelectedLinks() {
    const { checkedValues } = this.state;

    return (
      <div>
        {
          _.map(checkedValues, (item, idx) => {
            const { id, name } = item;

            return (
              <div key={idx} style={{ padding: '10px 15px' }}>
                <CheckBox
                  key={id}
                  onChange={() => this.toggleCheck(item)}
                  checked={this.optionIsChecked(checkedValues, id)}
                  label={name}
                />
              </div>
            );
          })
        }
      </div>
    );
  }

  renderContent() {
    const {
      options,
    } = this.state;

    return options ? this.renderTable() : <LoadingGauge />;
  }

  render() {
    const {
      page,
      pageSize,
      total,
      checkedValues,
      searchTerm,
    } = this.state;
    const { heading, label, onSubmit } = this.props;

    return (
      <SelectLinksBaseModal
        heading={heading}
        label={label}
        page={page}
        pageSize={pageSize}
        total={total}
        numOfCheckedValues={checkedValues.length}
        maxChecks={maxChecks}
        searchTerm={searchTerm}
        onSearchTermChange={this.onSearchTermChange}
        onPageChange={this.pageChange}
        onSearch={term => this.findLinks(checkedValues, 1, pageSize, term)}
        onSubmit={() => onSubmit(checkedValues)}
      >
        {this.renderSelectedLinks()}
        {this.renderContent()}
      </SelectLinksBaseModal>
    );
  }
}

SelectPdiLinksModal.propTypes = {
  action: PropTypes.string.isRequired,
  triggerName: PropTypes.string.isRequired,
  defaultCheckedValues: PropTypes.arrayOf(PropTypes.shape({})),
  style: PropTypes.shape({}),
  heading: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  linksDisabled: PropTypes.bool,
};

SelectPdiLinksModal.defaultProps = {
  style: {},
  defaultCheckedValues: [],
  linksDisabled: false,
};

SelectPdiLinksModal.contextTypes = {
  theme: PropTypes.string,
};

export default SelectPdiLinksModal;
