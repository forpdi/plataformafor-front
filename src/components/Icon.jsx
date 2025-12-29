import PropTypes from 'prop-types';
import { FontAwesomeIcon as FontAwesomeIconComponent } from '@fortawesome/react-fontawesome';

const Icon = ({
  icon = '',
  type = 'fas',
  size = '1.15rem',
  color = '',
  className = '',
  style = {},
  ...rest
}, { theme }) => {
  const iconClassName = color ? className : `${className} ${theme}-primary-color`;
  const iconDefaults = FontAwesomeIconComponent.defaultProps || {};
  return FontAwesomeIconComponent({
    ...iconDefaults,
    ...rest,
    style: { fontSize: size, ...style },
    color,
    icon: [type, icon],
    className: iconClassName,
  });
};

Icon.propTypes = {
  icon: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

Icon.contextTypes = {
  theme: PropTypes.string,
};

export default Icon;
