import React from 'react';
import PropTypes from 'prop-types';

import FpdiLoadingGif from 'forpdi/img/loading2.gif';
import ForriscoLoadingGif from 'forpdi/img/LoadForRisco.gif';
import ForLoadingGif from 'forpdi/img/LoadPlataformaFORVerde.gif';

const LoadingGauge = ({ size, align, propTheme }, { theme }) => {
  function getLoadingGif() {
    if (theme === 'frisco' || propTheme === 'frisco') {
      return ForriscoLoadingGif;
    }
    if (theme === 'fpdi' || propTheme === 'fpdi') {
      return FpdiLoadingGif;
    }

    return ForLoadingGif;
  }

  return (
    <div style={{ width: '100%', textAlign: align }}>
      <img
        src={getLoadingGif()}
        alt="Loading"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

LoadingGauge.propTypes = {
  size: PropTypes.string,
  align: PropTypes.string,
  propTheme: PropTypes.string,
};

LoadingGauge.defaultProps = {
  size: '75px',
  align: 'center',
  propTheme: 'for',
};

LoadingGauge.contextTypes = {
  theme: PropTypes.string,
};

export default LoadingGauge;
