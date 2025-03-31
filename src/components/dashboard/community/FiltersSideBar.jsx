import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Icon from 'forpdi/src/components/Icon';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

import Messages from 'forpdi/src/Messages';

const FiltersSideBarContainer = ({ children, style, className }, { theme }) => (
  <div
    style={style}
    className={`${theme}-community-bg ${theme}-secondary-color filters-sidebar ${className}`}
  >
    {children}
  </div>
);

FiltersSideBarContainer.propTypes = {
  style: PropTypes.shape({}),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

FiltersSideBarContainer.defaultProps = {
  style: {},
  className: '',
};

FiltersSideBarContainer.contextTypes = {
  theme: PropTypes.string,
};

const FiltersSideBar = ({
  filters,
  selectedFilters,
  onChange,
  loading,
}, { theme }) => {
  function onSelectChange(event) {
    const { name, value } = event.target;
    const updatedFilters = { ...selectedFilters, [name]: parseInt(value, 10) };
    onChange(updatedFilters);
  }

  function onMultiSelectChange(checkedValues, nameField) {
    const updatedFilters = { ...selectedFilters, [nameField]: checkedValues };
    onChange(updatedFilters);
  }

  function renderTitle() {
    return (
      <div className={`filters-sidebar__title ${theme}-secondary-bg ${theme}-primary-color`}>
        <Icon icon="filter" />
        <h2 className={`${theme}-primary-color`}>
          {Messages.get('label.filters')}
        </h2>
      </div>
    );
  }

  function cutOptions(options) {
    return _.map(options, option => ({ ...option, name: cutPhrase(option.name, 25) }));
  }

  function renderSelects() {
    return _.map(filters, ({
      label, name, options, disabled, renderExtraContent,
    }) => (
      <div key={name} className="filters-sidebar__filter-container">
        { typeof (selectedFilters[name]) !== 'number' ? (
          <MultiSelectWithSelectAll
            label={Messages.get('label.unitys')}
            onChange={(event) => { onMultiSelectChange(event, name); }}
            options={cutOptions(options).slice(1)}
            placeholderButtonLabel={Messages.get('label.selectOneUnit')}
            selectedOptions={selectedFilters[name]}
            hideSearchField={false}
          />
        ) : (
          <SelectBox
            key={name}
            className=""
            name={name}
            label={label}
            options={options}
            onChange={onSelectChange}
            value={selectedFilters[name]}
            disabled={disabled}
            enableChooseOptionSelection
          />
        )}
        {renderExtraContent && renderExtraContent()}
      </div>
    ));
  }

  function renderFilter() {
    return (
      <FiltersSideBarContainer style={{ padding: 0 }}>
        {renderTitle()}
        <div style={{ padding: '15px 15px' }}>
          {!loading ? renderSelects() : <LoadingGauge />}
        </div>
      </FiltersSideBarContainer>
    );
  }

  return renderFilter();
};

FiltersSideBar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    name: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })),
    disabled: PropTypes.bool,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

FiltersSideBar.defaultProps = {
  loading: false,
};

FiltersSideBar.contextTypes = {
  theme: PropTypes.string,
};

export { FiltersSideBarContainer };
export default FiltersSideBar;
