import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const IconLink = ({
  id,
  icon,
  className,
  hoverClass,
  style,
  loading,
  title,
  href,
  ...rest
}, { theme }) => {
  const iconLinkHoverClass = hoverClass === '' ? `${theme}-hover-3-bg ` : hoverClass;

  return (
    <a
      id={id}
      type="button"
      style={style}
      href={href}
      className={`icon-link ${theme}-primary-color ${iconLinkHoverClass} ${theme}-secondary-2-bg ${className}`}
      title={title}
      {...rest}
    >
      {loading ? <span>...</span> : <Icon icon={icon} />}
    </a>
  );
};

IconLink.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  hoverClass: PropTypes.string,
  style: PropTypes.shape({}),
  href: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

IconLink.defaultProps = {
  id: null,
  icon: '',
  className: '',
  hoverClass: '',
  style: {},
  loading: false,
  title: '',
};

IconLink.contextTypes = {
  theme: PropTypes.string,
};

export default IconLink;
