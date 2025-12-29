import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const Tag = ({ label, fontSize, onClick }, { theme }) => {
  const isClickable = !!onClick;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`tag ${theme}-primary-color ${theme}-background-bg`}
      onClick={onClick}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        textDecoration: isClickable ? 'underline' : 'none',
      }}
    >
      <Icon size={fontSize} icon="tag" />
      <p style={{ fontSize }}>{label}</p>
    </div>
  );
};

Tag.propTypes = {
  label: PropTypes.string,
  fontSize: PropTypes.string,
  onClick: PropTypes.func,
};

Tag.defaultProps = {
  fontSize: '13px',
  label: '',
  onClick: null,
};

Tag.contextTypes = {
  theme: PropTypes.string,
};

export default Tag;
