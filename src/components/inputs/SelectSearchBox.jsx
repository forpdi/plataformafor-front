/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import _ from 'underscore';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';
import Label from 'forpdi/src/components/typography/Label';
import Messages from 'forpdi/src/Messages';

class SelectSearchBox extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { lastSelected: null };
  }

  asStr = v => (v == null ? '' : String(v));

  normalizeOptions = (options, labelKey, valueKey) => _.map(options || [], (opt) => {
    const rawVal = opt && opt[valueKey];
    const rawLbl = opt && opt[labelKey];
    return {
      label: rawLbl != null ? String(rawLbl) : '',
      value: rawVal != null ? String(rawVal) : '',
      __raw: opt,
    };
  }).filter(o => o.value && o.label);

  findSelectedIn = (libOptions, value) => {
    const vStr = this.asStr(value);
    if (!vStr) return null;
    return (
      libOptions.find(o => this.asStr(o.value) === vStr
        || this.asStr(o.__raw && o.__raw.id) === vStr
        || this.asStr(o.__raw && o.__raw.value) === vStr) || null
    );
  };

  handleChange = (opt) => {
    const {
      id, name, onChange, onSearchClear,
    } = this.props;
    this.setState({ lastSelected: opt ? { label: opt.label, value: opt.value } : null });
    if (typeof onChange === 'function') {
      const syntheticEvent = { target: { id, name, value: this.asStr(opt ? opt.value : '') } };
      onChange(syntheticEvent);
    }
    if (typeof onSearchClear === 'function') onSearchClear();
  };

  render() {
    const {
      id, name, label, required, errorMsg, disabled, className, containerStyle,
      options, value, optionLabelName, optionValueName,
      placeholderButtonLabel, placeholderToEmpty,
      searchValue, onSearchChange, onSearchClear, searchPlaceholder,
      searchLoading, noResultsText,
    } = this.props;

    const libOptions = this.normalizeOptions(options, optionLabelName, optionValueName);
    const hasOptions = Array.isArray(options) && options.length > 0;

    // selecionado atual (das options) ou fallback (se options "somem" durante refresh)
    let selected = this.findSelectedIn(libOptions, value);
    if (!selected && this.state.lastSelected) {
      const vStr = this.asStr(value);
      if (!vStr || vStr === this.asStr(this.state.lastSelected.value)) {
        selected = this.state.lastSelected;
      }
    }

    const placeholder = (!hasOptions ? (placeholderToEmpty || placeholderButtonLabel) : placeholderButtonLabel)
      || Messages.get('label.select') || 'Selecione';

    const canPortal = !!(ReactDOM && typeof ReactDOM.createPortal === 'function');
    const portalProps = canPortal
      ? { menuPortalTarget: (typeof document !== 'undefined' ? document.body : null), menuPosition: 'fixed', menuShouldScrollIntoView: false }
      : {};

    // Busca controlada SÓ se o pai passar searchValue (ex.: Risco)
    const hasControlledSearch = typeof searchValue !== 'undefined';
    const searchProps = hasControlledSearch
      ? {
        inputValue: searchValue || '',
        onInputChange: (input, meta) => {
          const action = meta && meta.action;
          if (action === 'input-change' && typeof onSearchChange === 'function') onSearchChange(input);
          if (action === 'menu-close' && typeof onSearchClear === 'function') onSearchClear();
          return input;
        },
      }
      : {};

    return (
      <InputContainer
        style={{ width: '100%', ...containerStyle, cursor: disabled ? 'not-allowed' : 'default' }}
        className={className}
      >
        {label && (
          <Label required={required} htmlFor={id} className="label-vertical">
            {label}
          </Label>
        )}

        <ErrorControl errorMsg={errorMsg}>
          <div className={`${(this.context && this.context.theme) || 'fpdi'}-select-search`}>
            <Select
              inputId={id}
              name={name}
              options={libOptions}
              value={selected}
              onChange={this.handleChange}
              isDisabled={!!disabled}
              isClearable
              isSearchable
              placeholder={searchPlaceholder || placeholder}
              noOptionsMessage={() => (noResultsText || Messages.get('label.itemNotFound') || 'Nenhum resultado')}
              isLoading={!!searchLoading}
              {...portalProps}
              {...searchProps}
              styles={{
                container: base => ({ ...base, width: '100%' }),
                control: base => ({
                  ...base,
                  minHeight: 44,
                  height: 44,
                  borderRadius: 7,
                  borderColor: '#ced4da',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#c7c7c7' },
                  backgroundColor: disabled ? '#f7f7f7' : '#fff',
                  cursor: disabled ? 'not-allowed' : 'default',
                }),
                valueContainer: base => ({ ...base, height: 44, padding: '2px 10px' }),
                indicatorsContainer: base => ({ ...base, height: 44 }),
                input: base => ({ ...base, margin: 0, padding: 0 }),
                placeholder: base => ({ ...base, color: '#9a9a9a', fontSize: 14 }),
                singleValue: base => ({ ...base, fontSize: 14, color: '#333' }),
                menu: base => ({
                  ...base, zIndex: 9999, borderRadius: 7, overflow: 'hidden',
                }),
                option: (base, state) => ({
                  ...base,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: state.isFocused ? '#f5f5f5' : '#fff',
                  color: '#333',
                }),
                menuPortal: base => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </ErrorControl>
      </InputContainer>
    );
  }
}

SelectSearchBox.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  required: PropTypes.bool,
  errorMsg: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  containerStyle: PropTypes.shape({}),
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
  placeholderButtonLabel: PropTypes.string,
  placeholderToEmpty: PropTypes.string,
  // Busca controlada (opcional) — use em Risco
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  onSearchClear: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  searchLoading: PropTypes.bool,
  noResultsText: PropTypes.string,
};

SelectSearchBox.defaultProps = {
  id: null,
  name: null,
  label: null,
  required: false,
  errorMsg: '',
  disabled: false,
  className: '',
  containerStyle: {},
  value: null,
  optionLabelName: 'name',
  optionValueName: 'id',
  placeholderButtonLabel: 'Selecione',
  placeholderToEmpty: 'Nenhum item disponível',
  // ⚠️ undefined → busca NÃO-controlada por padrão
  searchValue: undefined,
  onSearchChange: undefined,
  onSearchClear: undefined,
  searchPlaceholder: 'Pesquisar…',
  searchLoading: false,
  noResultsText: 'Nenhum resultado',
};

SelectSearchBox.contextTypes = {
  theme: PropTypes.string,
};

export default SelectSearchBox;
