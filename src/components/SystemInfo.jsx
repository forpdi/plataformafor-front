import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';
import Text from 'forpdi/src/components/typography/Text';

const SystemInfo = ({ children, style, iconAlign }) => (
  <div style={{ display: 'flex', alignItems: 'center', ...style }}>
    <Icon icon="info-circle" style={{ alignSelf: iconAlign }} />
    <Text style={{ marginLeft: '10px', textTransform: 'none' }}>
      {children}
    </Text>
  </div>
);

SystemInfo.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({}),
  iconAlign: PropTypes.string,
};

SystemInfo.defaultProps = {
  style: null,
  iconAlign: 'center',
};

SystemInfo.contextTypes = {
  theme: PropTypes.string,
};

export default SystemInfo;
