import React from 'react';
import PropTypes from 'prop-types';

import { cutPhrase } from 'forpdi/src/utils/stringUtil';

const Text = ({
  children = null,
  text = null,
  maxLength = null,
  style = null,
  fontSize = '13px',
  className = '',
  title = '',
}, { theme }) => {
  function renderText() {
    return maxLength ? cutPhrase(text, maxLength) : text;
  }

  return (
    <p
      title={title}
      className={`${theme}-text-color ${className}`}
      style={{ fontSize, margin: 0, ...style }}
    >
      {
        text
          ? renderText()
          : children
      }
    </p>
  );
};

Text.propTypes = {
  style: PropTypes.shape({}),
  className: PropTypes.string,
  children: PropTypes.node,
  text: PropTypes.string,
  maxLength: PropTypes.number,
  fontSize: PropTypes.string,
  title: PropTypes.string,
};

Text.contextTypes = {
  theme: PropTypes.string,
};

export default Text;
