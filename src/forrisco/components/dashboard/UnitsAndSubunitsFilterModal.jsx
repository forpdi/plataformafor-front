import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TextField from 'forpdi/src/components/inputs/TextField';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import Label from 'forpdi/src/components/typography/Label';
import TertiaryButton from 'forpdi/src/components/buttons/TertiaryButton';
import ErrorControl from 'forpdi/src/components/ErrorControl';
import Text from 'forpdi/src/components/typography/Text';

import Messages from 'forpdi/src/Messages';
import { filterOnlyUnits, filterSubUnits, filterOnlySubUnits } from 'forpdi/src/forrisco/helpers/unitHelper';

class UnitsAndSubunitsFilterModal extends React.Component {
  constructor(props) {
    super(props);

    const { unitsAndSubunits, defaultCheckedValues } = props;
    this.setAllUnitsAndSubunits(unitsAndSubunits);

    this.state = {
      units: this.allUnits,
      searchedUnit: '',
      checkedValues: defaultCheckedValues,
      emptySelectionError: null,
    };
  }

  componentWillReceiveProps(newProps) {
    const { unitsAndSubunits } = this.props;
    if (!_.isEqual(unitsAndSubunits, newProps.unitsAndSubunits)) {
      this.setAllUnitsAndSubunits(newProps.unitsAndSubunits);

      this.setState({
        units: this.allUnits,
        searchedUnit: '',
        checkedValues: newProps.defaultCheckedValues,
        emptySelectionError: null,
      });
    }
  }

  setAllUnitsAndSubunits(unitsAndSubunits) {
    this.allUnits = filterOnlyUnits(unitsAndSubunits);
    this.subunits = filterOnlySubUnits(unitsAndSubunits);
  }

  onSearchFieldChange = (event) => {
    const { value } = event.target;

    this.setState({
      searchedUnit: value,
      units: _.filter(
        this.allUnits,
        ({ name, abbreviation }) => (name.toLowerCase().includes(value.toLowerCase()))
                                    || (abbreviation.toLowerCase().includes(value.toLowerCase())),
      ),
    });
  }

  onFilterHandler = () => {
    const { onFilter } = this.props;
    const { checkedValues } = this.state;
    if (checkedValues.length === 0) {
      this.setState({
        emptySelectionError: Messages.get('label.noUnitOrSubunitSelected'),
      });
    } else {
      this.setState({ emptySelectionError: null });

      Modal.hide();
      onFilter(checkedValues);
    }
  }

  onClearHandler = () => {
    const { onClear } = this.props;

    this.setState({
      emptySelectionError: null,
      checkedValues: [],
    });

    Modal.hide();
    onClear();
  }

  unitOrSubunitIsChecked(id) {
    const { checkedValues } = this.state;

    return checkedValues.includes(id);
  }

  allIsChecked(ids) {
    const { checkedValues } = this.state;

    return _.every(ids, id => checkedValues.includes(id));
  }

  toggleAll = (ids) => {
    const { checkedValues } = this.state;

    const updatedCheckList = this.allIsChecked(ids)
      ? _.filter(checkedValues, checkedId => !ids.includes(checkedId))
      : [...checkedValues, ...ids];

    this.setState({ checkedValues: updatedCheckList });
  }

  toggleUnitsOrSubunits = (id) => {
    const { checkedValues } = this.state;
    const updatedCheckList = checkedValues.includes(id)
      ? _.filter(checkedValues, checkedId => checkedId !== id)
      : [...checkedValues, id];

    this.setState({ checkedValues: updatedCheckList });
  }

  renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.unitSubunit')}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderSearchField() {
    const { searchedUnit } = this.state;

    return (
      <TextField
        onChange={this.onSearchFieldChange}
        value={searchedUnit}
        label={Messages.get('label.research')}
        placeholder={Messages.get('label.searchUnitByNameOrAbbreviation')}
        containerStyle={{ margin: 0 }}
      />
    );
  }

  renderUnitsAndSubunits() {
    const { emptySelectionError, units } = this.state;

    return (
      <div style={{ marginTop: '2rem' }}>
        <Label style={{ marginBottom: '1rem' }}>{Messages.get('label.unitSubunitList')}</Label>
        <ErrorControl errorMsg={emptySelectionError}>
          <div className="unit-sub-filter-modal__chackboxes">
            <div className="custom-scrollbar" style={{ height: '27rem', overflowY: 'auto' }}>
              {
                units.length > 0
                  ? this.renderCheckboxes()
                  : (
                    <div className="unit-sub-filter-modal__chack-group">
                      <Text>{Messages.get('label.noRecords')}</Text>
                    </div>
                  )
              }
            </div>
          </div>
        </ErrorControl>
      </div>
    );
  }

  renderCheckboxes() {
    const { units } = this.state;

    return _.map(units, ({ name, abbreviation, id }) => {
      const unitSubunits = filterSubUnits(this.subunits, id);
      const unitSubunitIds = _.map(unitSubunits, subunit => subunit.id);
      return (
        <div className="unit-sub-filter-modal__chack-group" key={id}>
          {
            <div>
              <CheckBox
                onChange={() => this.toggleUnitsOrSubunits(id)}
                checked={this.unitOrSubunitIsChecked(id)}
                label={`${abbreviation} - ${name}`}
              />
              {
                unitSubunitIds.length > 0 && (
                  <div style={{ marginLeft: '2rem' }}>
                    <CheckBox
                      key={`select-all-subunits-${id}`}
                      onChange={() => this.toggleAll(unitSubunitIds)}
                      checked={this.allIsChecked(unitSubunitIds)}
                      label={Messages.get('label.selectAll')}
                    />
                    {
                      _.map(unitSubunits, subunit => this.renderSubunitsCheckBoxes(subunit))
                    }
                  </div>
                )
              }
            </div>
          }
        </div>
      );
    });
  }

  renderSubunitsCheckBoxes({ name, abbreviation, id }) {
    return (
      <CheckBox
        key={id}
        onChange={() => this.toggleUnitsOrSubunits(id)}
        checked={this.unitOrSubunitIsChecked(id)}
        label={`${abbreviation} - ${name}`}
      />
    );
  }

  renderButtons() {
    const buttonsStyle = { marginLeft: '1rem', width: '130px' };
    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <SecondaryButton
          text={Messages.get('label.cancel')}
          style={buttonsStyle}
          onClick={() => Modal.hide()}
          backgroundClassName="frisco-primary"
        />
        <TertiaryButton
          text={Messages.get('label.clean')}
          style={buttonsStyle}
          onClick={this.onClearHandler}
        />
        <PrimaryButton
          text={Messages.get('label.filtrate')}
          style={buttonsStyle}
          onClick={this.onFilterHandler}
        />
      </div>
    );
  }

  render() {
    return (
      <Modal width="650px" height="auto">
        {this.renderHeader()}
        {this.renderSearchField()}
        {this.renderUnitsAndSubunits()}
        {this.renderButtons()}
      </Modal>
    );
  }
}

UnitsAndSubunitsFilterModal.propTypes = {
  defaultCheckedValues: PropTypes.arrayOf(PropTypes.number),
  unitsAndSubunits: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onFilter: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

UnitsAndSubunitsFilterModal.defaultProps = {
  defaultCheckedValues: [],
};

export default UnitsAndSubunitsFilterModal;
