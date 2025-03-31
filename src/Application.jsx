import React from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastr';

import { toastrConfig } from 'forpdi/src/consts';

class Application extends React.Component {
  getChildContext() {
    return {
      toastr: this,
    };
  }

  addAlertError(msg) {
    this.refs.container.clear();
    this.refs.container.error(
      msg, null, toastrConfig,
    );
  }

  addAlertSuccess(msg) {
    this.refs.container.clear();
    this.refs.container.success(
      msg, null, toastrConfig,
    );
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
        <ToastContainer ref="container" className="toast-top-center" />
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
