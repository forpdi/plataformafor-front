/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { Modal as BSModal } from 'react-bootstrap';
import IconButton from 'forpdi/src/components/buttons/IconButton';

class GlobalModalController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      content: null,
      theme: 'frisco',
      callback: null,
    };
    GlobalModalController.instance = this;
  }

  getChildContext() {
    return {
      theme: this.state.theme || 'frisco',
    };
  }

  open = (content, theme) => {
    this.setState({
      show: true,
      content,
      theme: theme || 'frisco',
    });
  }

  close = (callback) => {
    this.setState({ show: false, callback });
  }

  handleExited = () => {
    if (this.state.callback) {
      this.state.callback();
      this.setState({ callback: null });
    }
  }

  render() {
    const { show, content, theme } = this.state;
    const themeClass = `${theme}-text-color`;

    return (
      <BSModal
        show={show}
        onHide={() => this.close()}
        onExited={this.handleExited}
        backdrop
        keyboard
        dialogClassName={`modal-layout ${themeClass}`}
        contentClassName="bg-transparent border-0 shadow-none"
      >
        {content}
      </BSModal>
    );
  }
}

GlobalModalController.childContextTypes = {
  theme: PropTypes.string,
};

const ModalContent = ({
  children,
  width,
  height,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="modal-content-custom"
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '0 1rem 1rem',
        width: width || '600px',
        overflow: 'visible',
        minWidth: width || '600px',
        height: height || 'inherit',
        minHeight: height,
        position: 'relative',
        margin: '0 auto',
        pointerEvents: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
        }}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ display: 'inline-block', borderRadius: '50%' }}
        >
          <IconButton
            icon="times"
            onClick={() => Modal.hide()}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: isHovered ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              color: '#666',
            }}
          />
        </div>
      </div>

      {/* Container do conteúdo com leve respiro superior para não colar na borda */}
      <div style={{ clear: 'both', paddingTop: '15px' }}>
        {children}
      </div>
    </div>
  );
};

ModalContent.propTypes = {
  children: PropTypes.node,
  width: PropTypes.string,
  height: PropTypes.string,
};

const Modal = ModalContent;

const modalRootElement = document.getElementById('main-global-modal');

if (modalRootElement) {
  const root = createRoot(modalRootElement);
  root.render(<GlobalModalController />);
}

Modal.show = (modalComponent, theme) => {
  if (GlobalModalController.instance) {
    GlobalModalController.instance.open(modalComponent, theme);
  }
};

Modal.hide = (callback) => {
  if (GlobalModalController.instance) {
    GlobalModalController.instance.close(callback);
  }
};

Modal.Line = () => <hr style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)', borderBottom: 'none', margin: '10px 0px' }} />;

export default Modal;
