import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';

import Messages from 'forpdi/src/Messages';

const SwitchToggleButton = ({
  checked,
  id,
  name,
  label,
  onChange,
  noOption,
  yesOption,
}) => (
  <div>
    <Label>
      <b style={{ paddingRight: '1rem', textTransform: 'initial' }}>
        {label}
      </b>
    </Label>
    <Label style={{ paddingRight: '1rem', textTransform: 'initial' }} htmlFor={id}>
      {noOption}
    </Label>
    <div className="toggle-switch">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="toggle-switch-checkbox"
      />
      <Label htmlFor={id} className="toggle-switch-label">
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </Label>
    </div>
    <Label style={{ paddingLeft: '1rem', textTransform: 'initial' }} htmlFor={id}>
      {yesOption}
    </Label>
  </div>
);

SwitchToggleButton.propTypes = {
  checked: PropTypes.bool.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  noOption: PropTypes.string,
  yesOption: PropTypes.string,
};

SwitchToggleButton.defaultProps = {
  id: null,
  name: null,
  noOption: Messages.get('label.no'),
  yesOption: Messages.get('label.yes'),
};

SwitchToggleButton.contextTypes = {
  theme: PropTypes.string,
};

export default SwitchToggleButton;
