import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import IconButton from 'forpdi/src/components/buttons/IconButton';

class ModalWrapper extends React.Component {
  getChildContext() {
    const { theme } = this.props;
    return { theme };
  }

  render() {
    const { children } = this.props;

    return <div className="modal-layout modal-dialog modal-sm">{children}</div>;
  }
}

ModalWrapper.propTypes = {
  children: PropTypes.node,
  theme: PropTypes.string,
};

ModalWrapper.defaultProps = {
  children: null,
  theme: 'frisco',
};

ModalWrapper.childContextTypes = {
  theme: PropTypes.string.isRequired,
};


const Modal = ({
  children,
  width,
  height,
}, { theme }) => (
  <div className={`${theme}-text-color`}>
    <div
      className="modal-content"
      style={{
        borderRadius: '10px',
        padding: '0 1rem 1rem',
        width,
        overflow: 'hidden',
        minWidth: width,
        height,
        minHeight: height,
      }}
    >
      <IconButton
        icon="times"
        onClick={() => Modal.hide()}
        style={{
          float: 'right',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      {children}
    </div>
  </div>
);

Modal.modalDiv = document.getElementById('main-global-modal');

$(Modal.modalDiv).on('hidden.bs.modal', () => {
  ReactDOM.render(<div />, Modal.modalDiv);
});

Modal.show = (modal, theme) => {
  ReactDOM.render(
    <ModalWrapper theme={theme}>
      {modal}
    </ModalWrapper>,
    Modal.modalDiv,
  );
  $(Modal.modalDiv).modal('show');
};

Modal.hide = (callback) => {
  $(Modal.modalDiv).one('hidden.bs.modal', () => {
    callback && callback();
  });
  $(Modal.modalDiv).modal('hide');
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
};

Modal.defaultProps = {
  width: '600px',
  height: 'inherit',
};

Modal.contextTypes = {
  theme: PropTypes.string.isRequired,
};


Modal.Line = () => <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />;

export default Modal;
