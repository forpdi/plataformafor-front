import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import SelectLinksModal from 'forpdi/src/forrisco/components/risk/links/SelectLinksBaseModal';

import { MIN_PAGE_SIZE } from 'forpdi/src/consts';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';

class SelectProcessObjectivesModal extends React.Component {
  constructor(props) {
    super(props);

    const { defaultCheckedValues } = props;

    this.state = {
      checkedValues: defaultCheckedValues,
      options: null,
      page: 1,
      pageSize: MIN_PAGE_SIZE,
      total: null,
      totalIncludingChecked: null,
      searchTerm: '',
    };

    if (defaultCheckedValues.length > 0) {
      this.findLinks([], 1, 0, '');
    }
  }

  componentDidMount() {
    const { checkedValues, pageSize, searchTerm } = this.state;

    ProcessStore.on('listObjectivesByPlan', ({ data, total }, { checkValuesIsEmpty }) => {
      const { totalIncludingChecked } = this.state;
      this.setState({
        options: data,
        total,
        totalIncludingChecked: checkValuesIsEmpty ? total : totalIncludingChecked,
      });
    }, this);

    this.findLinks(checkedValues, 1, pageSize, searchTerm);
  }

  findLinks(checkedValues, page, pageSize, searchTerm) {
    const { planRiskId } = this.props;

    const selectedIds = _.map(checkedValues, ({ id }) => id);
    ProcessStore.dispatch({
      action: ProcessStore.ACTION_LIST_OBJECTIVES_BY_PLAN,
      data: {
        planId: planRiskId,
        excludedIds: selectedIds,
        page,
        pageSize,
        term: searchTerm.trim(),
      },
      opts: { checkValuesIsEmpty: checkedValues.length === 0 },
    });
  }

  optionIsChecked = (checkedValues, id) => _.map(checkedValues, value => value.id).includes(id);

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

    const updatedCheckList = _.map(checkedValues, value => value.id).includes(id)
      ? _.filter(checkedValues, ({ id: checkedId }) => checkedId !== id)
      : [...checkedValues, item];

    this.setState({ checkedValues: updatedCheckList, page: 1 });
    this.findLinks(updatedCheckList, 1, pageSize, searchTerm);
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

    const renderLabel = ({ description }) => <span>{description}</span>;

    const renderProcess = (({ process }) => <span>{process.name}</span>);

    const columns = [
      {
        width: '5%',
        render: renderCheckBoxes,
      },
      {
        width: '50%',
        render: renderLabel,
      },
      {
        width: '45%',
        render: renderProcess,
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
            const { id, description } = item;

            return (
              <div key={idx} style={{ padding: '10px 15px' }}>
                <CheckBox
                  key={id}
                  onChange={() => this.toggleCheck(item)}
                  checked={this.optionIsChecked(checkedValues, id)}
                  label={description}
                />
              </div>
            );
          })
        }
      </div>
    );
  }

  renderContent() {
    const { options } = this.state;

    return options ? this.renderTable() : <LoadingGauge />;
  }

  render() {
    const {
      page,
      pageSize,
      total,
      totalIncludingChecked,
      checkedValues,
      searchTerm,
    } = this.state;
    const { heading, label, onSubmit } = this.props;

    return (
      <SelectLinksModal
        heading={heading}
        label={label}
        page={page}
        pageSize={pageSize}
        total={total}
        numOfCheckedValues={checkedValues.length}
        maxChecks={totalIncludingChecked}
        searchTerm={searchTerm}
        onSearchTermChange={this.onSearchTermChange}
        onPageChange={this.pageChange}
        onSearch={term => this.findLinks(checkedValues, 1, pageSize, term)}
        onSubmit={() => onSubmit(checkedValues)}
      >
        {this.renderSelectedLinks()}
        {this.renderContent()}
      </SelectLinksModal>
    );
  }
}

SelectProcessObjectivesModal.propTypes = {
  planRiskId: PropTypes.number.isRequired,
  defaultCheckedValues: PropTypes.arrayOf(PropTypes.shape({})),
  heading: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

SelectProcessObjectivesModal.defaultProps = {
  defaultCheckedValues: [],
};

SelectProcessObjectivesModal.contextTypes = {
  theme: PropTypes.string,
};

export default SelectProcessObjectivesModal;
