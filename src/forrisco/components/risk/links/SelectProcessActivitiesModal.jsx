import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import Modal from 'forpdi/src/components/modals/Modal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TextField from 'forpdi/src/components/inputs/TextField';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import SelectLinksModal from 'forpdi/src/forrisco/components/risk/links/SelectLinksBaseModal';

import { MIN_PAGE_SIZE } from 'forpdi/src/consts';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import { validationActivities } from 'forpdi/src/forrisco/validations/validationRisk';
import Messages from 'forpdi/src/Messages';

class SelectProcessActivitiesModal extends React.Component {
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
      errors: {},
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm } = this.state;

    ProcessStore.on('listProcessByPlan', ({ data, total }) => {
      this.setState({
        options: data,
        total,
      });
    }, this);

    this.findLinks(1, pageSize, searchTerm);
  }

  findLinks(page, pageSize, searchTerm) {
    const { planRiskId } = this.props;

    ProcessStore.dispatch({
      action: ProcessStore.ACTION_LIST_BY_PLAN,
      data: {
        planId: planRiskId,
        page,
        pageSize,
        term: searchTerm.trim(),
      },
    });
  }

  optionIsChecked = (checkedValues, id) => _.map(checkedValues, value => value.id).includes(id);

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  checkItem = (item) => {
    const { checkedValues } = this.state;
    const updatedCheckList = [...checkedValues, { process: item, name: '' }];

    this.setState({ checkedValues: updatedCheckList });
  }

  uncheckItem = (indexToUncheck) => {
    const { checkedValues } = this.state;
    const updatedCheckList = _.filter(checkedValues, (item, idx) => idx !== indexToUncheck);

    this.setState({ checkedValues: updatedCheckList });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm } = this.state;

    this.findLinks(page, pageSize, searchTerm);
    this.setState({
      page,
      pageSize,
    });
  }

  onActivityNameChange = (e, indexToChange) => {
    const { checkedValues } = this.state;

    const updatedCheckList = _.map(
      checkedValues,
      (item, idx) => (indexToChange === idx ? { ...item, name: e.target.value } : item),
    );

    this.setState({ checkedValues: updatedCheckList });
  }

  submit = () => {
    const { onSubmit } = this.props;
    const { checkedValues } = this.state;

    const onSuccess = () => {
      onSubmit(checkedValues);
      Modal.hide();
    };

    validationActivities(checkedValues, onSuccess, this);
  }

  renderTable() {
    const { options } = this.state;

    const renderCheckBoxes = (item) => {
      const { id } = item;

      return (
        <CheckBox
          key={id}
          onChange={() => this.checkItem(item)}
          checked={false}
        />
      );
    };

    const renderLabel = ({ name }) => <span>{name}</span>;

    const columns = [
      {
        width: '5%',
        render: renderCheckBoxes,
      },
      {
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
    const { checkedValues, errors } = this.state;

    return (
      <div>
        {
          _.map(checkedValues, (item, idx) => {
            const { id, process, name } = item;

            return (
              <div
                key={idx}
                className="row"
                style={{
                  padding: '10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  margin: 0,
                }}
              >
                <div className="col col-sm-4">
                  <CheckBox
                    key={id}
                    onChange={() => this.uncheckItem(idx)}
                    checked
                    label={process.name}
                  />
                </div>
                <div className="col col-sm-8">
                  <TextField
                    id="name"
                    name="name"
                    onChange={e => this.onActivityNameChange(e, idx)}
                    value={name}
                    errorMsg={errors[`activities${idx}`]}
                    maxLength={255}
                    required
                    containerStyle={{ margin: 0 }}
                  />
                </div>
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
      checkedValues,
      searchTerm,
    } = this.state;

    return (
      <SelectLinksModal
        heading={Messages.get('label.risk.registerActivityObjective')}
        label={Messages.get('label.risk.processActivity')}
        page={page}
        pageSize={pageSize}
        total={total}
        numOfCheckedValues={checkedValues.length}
        searchTerm={searchTerm}
        onSearchTermChange={this.onSearchTermChange}
        onPageChange={this.pageChange}
        onSearch={term => this.findLinks(1, pageSize, term)}
        onSubmit={this.submit}
        closeModalOnSubmit={false}
      >
        {this.renderSelectedLinks()}
        {this.renderContent()}
      </SelectLinksModal>
    );
  }
}

SelectProcessActivitiesModal.propTypes = {
  planRiskId: PropTypes.number.isRequired,
  defaultCheckedValues: PropTypes.arrayOf(PropTypes.shape({})),
  onSubmit: PropTypes.func.isRequired,
};

SelectProcessActivitiesModal.defaultProps = {
  defaultCheckedValues: [],
};

SelectProcessActivitiesModal.contextTypes = {
  theme: PropTypes.string,
};

export default SelectProcessActivitiesModal;
