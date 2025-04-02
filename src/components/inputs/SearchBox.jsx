import React from 'react';
import PropTypes from 'prop-types';

import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TextField from 'forpdi/src/components/inputs/TextField';

import Messages from 'forpdi/src/Messages';

const SearchBox = ({
  value,
  style,
  containerStyle,
  onChange,
  onSubmit,
  placeholder,
  className,
}, { theme }) => {
  function onSubmitKey(key) {
    if (key === 'Enter') {
      onSubmit(value);
    }
  }

  function onClearSearchTerm() {
    onChange('');
    onSubmit('');
  }

  return (
    <div className={`search-box ${className}`} style={containerStyle}>
      <TextField
        type="text"
        value={value}
        maxLength={2025}
        containerStyle={{ ...style, width: '100%' }}
        className={`text-field ${theme}-text-color ${theme}-secondary-2-bg ${theme}-border-color-1 ${className}`}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyPress={e => onSubmitKey(e.key)}
      />
      <SecondaryIconButton
        title={Messages.get('label.search')}
        className="search-box-submit-button"
        icon="search"
        onClick={() => onSubmit(value)}
        theme={theme}
      />
      <SecondaryIconButton
        title={Messages.get('label.clean')}
        className="search-box-clear-button"
        icon="times"
        onClick={() => onClearSearchTerm()}
        theme={theme}
      />
    </div>
  );
};

SearchBox.contextTypes = {
  theme: PropTypes.string.isRequired,
};

SearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  value: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

SearchBox.defaultProps = {
  value: '',
  style: {},
  containerStyle: {},
  placeholder: '',
  className: '',
};

export default SearchBox;
