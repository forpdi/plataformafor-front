import React from "react";

export default React.createClass({
	render() {
    const { type, loading, onClick, children } = this.props;

    return (
      <button
        type={type}
        className="btn btn-sm btn-success"
        disabled={!!loading}
        style={{ cursor: !!loading ? 'wait' : 'pointer' }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
});
