import React from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastr';

import { toastrConfig } from 'forpdi/src/consts';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = null;
  }

  getChildContext() {
    return {
      toastr: this,
    };
  }

  addAlertError(msg) {
    if (this.containerRef) {
      this.containerRef.clear();
      this.containerRef.error(
        msg, null, toastrConfig,
      );
    }
  }

  addAlertSuccess(msg) {
    if (this.containerRef) {
      this.containerRef.clear();
      this.containerRef.success(
        msg, null, toastrConfig,
      );
    }
  }

  renderApplicationContainer() {
    const { children } = this.props;
    return (
      <div style={{ flex: 1, width: '100%' }}>
        {children}
      </div>
    );
  }

  render() {
    return (
      <main className="fpdi-app-container">
        <ToastContainer ref={(ref) => { this.containerRef = ref; }} className="toast-top-center" />
        {this.renderApplicationContainer()}
      </main>
    );
  }
}

Application.propTypes = {
  children: PropTypes.node,
};

Application.defaultProps = {
  children: null,
};

Application.childContextTypes = {
  toastr: PropTypes.shape({}),
};

export default Application;
