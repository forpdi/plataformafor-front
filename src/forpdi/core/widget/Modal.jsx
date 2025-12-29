import _ from 'underscore';
import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';

import FeedbackPost from "forpdi/src/forpdi/core/widget/contact/FeedbackPost.jsx";
import ReportProblem from "forpdi/src/forpdi/core/widget/contact/ReportProblem.jsx";
import Messages from "forpdi/src/Messages.jsx";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import VerticalInput from "forpdi/src/forpdi/core/widget/form/VerticalInput.jsx";
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton';

const ensureContainer = (id) => {
  const existing = document.getElementById(id);
  if (existing) return existing;

  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
};

const LEGACY_MODAL_CONTAINER_ID = 'legacy-global-modal';
const LEGACY_NO_CLOSE_CONTAINER_ID = 'legacy-global-modal-noclose';
const DEFAULT_MODAL_THEME = 'fpdi';

var EL = ensureContainer(LEGACY_MODAL_CONTAINER_ID);
var NC = ensureContainer(LEGACY_NO_CLOSE_CONTAINER_ID);

const modalRoot = EL ? createRoot(EL) : null;
const modalNoCloseRoot = NC ? createRoot(NC) : null;

class LegacyModalProvider extends React.Component {
  getChildContext() {
    return { theme: this.props.theme || DEFAULT_MODAL_THEME };
  }

  render() {
    return this.props.children;
  }
}

LegacyModalProvider.childContextTypes = {
  theme: PropTypes.string,
};

LegacyModalProvider.propTypes = {
  theme: PropTypes.string,
  children: PropTypes.node,
};

const LegacyModalWrapper = ({ children, onClose, canClose = true, backdrop = true, theme = DEFAULT_MODAL_THEME }) => {
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape' && canClose) {
        evt.preventDefault();
        if (typeof onClose === 'function') onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = previousOverflow;
    };
  }, [canClose, onClose]);

  const handleDismissClick = React.useCallback((evt) => {
    const dismissEl = evt.target.closest?.('[data-dismiss="modal"],[data-bs-dismiss="modal"]');
    if (dismissEl && canClose) {
      evt.preventDefault();
      if (typeof onClose === 'function') onClose();
    }
  }, [canClose, onClose]);

  const handleBackdropClick = (evt) => {
    if (!canClose) return;
    if (evt.target === evt.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <LegacyModalProvider theme={theme}>
      {backdrop ? <div className="modal-backdrop fade show" /> : null}
      <div
        className="modal fade show"
        style={{ display: 'block' }}
        role="dialog"
        tabIndex="-1"
        onClickCapture={handleDismissClick}
        onMouseDown={handleBackdropClick}
      >
        {children}
      </div>
    </LegacyModalProvider>
  );
};

var AlertModal = React.createClass({
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            <p>{this.props.message}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.ok")}</button>
          </div>
        </div>
      </div>
    );
  }
});


var NoClosableModal = React.createClass({
  getDefaultProps() {
    return {
      confirmText: Messages.get("label.ok"),
      confirmTitle: Messages.get("label.confirmation"),
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content fpdi-modal-confirmCustom">
          <div className="modal-header fpdi-modal-header">
            <h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel"><i className="mdi mdi-confirmModalCustom mdi-48px" id="modalIcon"></i> {this.props.confirmTitle}</h4>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal">
            <br />
            <div id>{this.props.message}</div>
          </div>
        </div>
      </div>
    );
  }
});

var ConfirmModal = React.createClass({
  /*render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
            </div>
            <div className="modal-body">
            {this.props.message}
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Cancelar</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>Confirmar</button>
            </div>
        </div>
      </div>
    );
  }*/

  getDefaultProps() {
    return {
      confirmText: Messages.get("label.ok"),
      confirmTitle: Messages.get("label.confirmation"),
    };
  },
  render() {
    const modalTitle = this.props.confirmTitle || "Atenção";
    return (
      <div className="modal-dialog modal-md" style={{ maxWidth: '520px', width: '90%' }}>
        <div className="modal-content fpdi-modal-confirmCustom" style={{ width: '100%' }}>
          <div className="modal-header fpdi-modal-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 20px 10px 20px',
            borderBottom: 'none',
            position: 'relative'
          }}>
            <h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#2c2c2c',
              width: '100%',
              textAlign: 'center'
            }}>
              <i className="mdi mdi-checkbox-marked-circle" style={{ fontSize: '20px', color: '#28a745', lineHeight: 1 }} />
              <span>{modalTitle}</span>
            </h4>
            <button
              type="button"
              className="close"
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                margin: 0,
                padding: '6px 10px',
                fontSize: '16px',
                lineHeight: 1,
                color: '#6c757d',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
              onClick={this.props.onConfirm}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal" style={{
            padding: '10px 24px 16px 24px',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#555',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>{this.props.message}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer" style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 24px 16px 24px',
            borderTop: 'none'
          }}>
            <button type="button" className="btn btn-sm btn-success modal-button" onClick={this.props.onConfirm} style={{
              minWidth: '96px',
              padding: '10px 20px',
              fontWeight: 600,
              borderRadius: '6px'
            }}>
              {this.props.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }
});

var ConfirmModalCustom = React.createClass({
  getDefaultProps() {
    return {
      confirmText: Messages.get("label.yes"),
      declineText: Messages.get("label.no")
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-md fpdi-modal-confirmCustom-dialog" style={{ maxWidth: '580px', width: '90%' }}>
        <div className="modal-content fpdi-modal-confirmCustom" style={{ width: '100%' }}>
          <div className="modal-header fpdi-modal-header fpdi-modal-confirmCustom-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px 8px 24px',
            borderBottom: 'none',
            position: 'relative'
          }}>
            <h4 className="modal-title fpdi-modal-confirmCustom-title" id="myModalLabel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#333'
            }}>
              <i className="mdi-confirmModalCustom mdi mdi-checkbox-marked-circle" id="modalIcon" style={{
                fontSize: '28px',
                color: '#28a745',
                display: 'inline-block',
                lineHeight: 1
              }}></i>
              <span>{Messages.get("label.confirmation")}</span>
            </h4>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                margin: 0,
                padding: '4px 8px',
                fontSize: '28px',
                lineHeight: 1,
                color: '#999',
                opacity: 0.6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'opacity 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.color = '#333'; }}
              onMouseLeave={(e) => { e.target.style.opacity = '0.6'; e.target.style.color = '#999'; }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal fpdi-modal-confirmCustom-body" style={{
            padding: '12px 24px',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#555'
          }}>
            <p style={{ margin: 0 }}>{this.props.text}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer fpdi-modal-confirmCustom-footer" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            padding: '8px 24px 12px 24px',
            borderTop: 'none'
          }}>
            <button
              type="button"
              className="btn btn-sm modal-button"
              id="confirmModalCustom"
              onClick={this.props.onConfirm}
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                color: '#ffffff',
                fontWeight: 500,
                padding: '8px 20px',
                minWidth: '80px',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.borderColor = '#218838';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.borderColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {this.props.confirmText}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary modal-button"
              onClick={this.props.onCancel}
              style={{
                backgroundColor: '#f8f9fa',
                borderColor: '#dee2e6',
                color: '#495057',
                padding: '8px 20px',
                minWidth: '80px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.borderColor = '#dee2e6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              {this.props.declineText}
            </button>
          </div>
        </div>
      </div>
    );
  }
});



var ConfirmConviteUser = React.createClass({
  render() {
    var msg1 = (Messages.get("label.success.emailSent") + " ");
    var msg2 = Messages.get("label.success.userCompleteRegister");
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content fpdi-modal-confirmCustomUser">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel">{Messages.get("label.confirmation")}</h4>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal modal-content-confirmUser">
            <p id> {msg1}<strong>{this.props.text}</strong>{msg2}</p>
          </div>
        </div>
      </div>
    );
  }
});

var CancelModalCustom = React.createClass({
  getDefaultProps() {
    return {
      confirmText: Messages.get("label.yes"),
      declineText: Messages.get("label.no")
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-md fpdi-modal-cancelCustom-dialog" style={{ maxWidth: '580px', width: '90%' }}>
        <div className="modal-content fpdi-modal-confirmCustom" style={{ width: '100%' }}>
          <div className="modal-header fpdi-modal-header fpdi-modal-cancelCustom-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px 8px 24px',
            borderBottom: 'none',
            position: 'relative'
          }}>
            <h4 className="modal-title fpdi-modal-cancelCustom-title" id="myModalLabel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#333'
            }}>
              <i className="mdi-cancelModalCustom mdi mdi-alert-circle" id="modalIcon" style={{
                fontSize: '28px',
                color: '#FF0000',
                display: 'inline-block',
                lineHeight: 1
              }}></i>
              <span>{Messages.get("label.alert")}</span>
            </h4>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                margin: 0,
                padding: '4px 8px',
                fontSize: '28px',
                lineHeight: 1,
                color: '#999',
                opacity: 0.6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'opacity 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.color = '#333'; }}
              onMouseLeave={(e) => { e.target.style.opacity = '0.6'; e.target.style.color = '#999'; }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal fpdi-modal-cancelCustom-body" style={{
            padding: '12px 24px',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#555'
          }}>
            <p style={{ margin: 0 }}>{this.props.text}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer fpdi-modal-cancelCustom-footer" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            padding: '8px 24px 12px 24px',
            borderTop: 'none'
          }}>
            <button
              type="button"
              className="btn btn-sm modal-button"
              id="cancelModalCustom"
              onClick={this.props.onConfirm}
              style={{
                backgroundColor: '#FF0000',
                borderColor: '#FF0000',
                color: '#ffffff',
                fontWeight: 500,
                padding: '8px 20px',
                minWidth: '80px',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e60000';
                e.target.style.borderColor = '#e60000';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(255, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FF0000';
                e.target.style.borderColor = '#FF0000';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {this.props.confirmText}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary modal-button"
              onClick={this.props.onCancel}
              style={{
                backgroundColor: '#f8f9fa',
                borderColor: '#dee2e6',
                color: '#495057',
                padding: '8px 20px',
                minWidth: '80px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.borderColor = '#dee2e6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              {this.props.declineText}
            </button>
          </div>
        </div>
      </div>
    );
  }
});

var DeleteConfirmModal = React.createClass({
  getDefaultProps() {
    return {
      text: Messages.get("label.deleteRecord"),
      confirmText: Messages.get("label.delete"),
      declineText: Messages.get("label.cancel")
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{Messages.get("label.attention")}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            <p>{this.props.text}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
          </div>
        </div>
      </div>
    );
  }
});

var DeleteConfirmModalCustom = React.createClass({
  getDefaultProps() {
    return {
      confirmText: Messages.get("label.delete"),
      declineText: Messages.get("label.cancel")
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{Messages.get("label.attention")}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            <p>{this.props.text}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
          </div>
        </div>
      </div>
    );
  }
});




var ConcludeGoalModalCustom = React.createClass({
  getDefaultProps() {
    return {
      confirmText: Messages.get("label.confirm"),
      declineText: Messages.get("label.cancel")
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel">{Messages.get("label.confirmation")}</h4>
          </div>
          <div className="modal-body fpdi-modal-body-close-goal">
            <p id>{this.props.text}</p>
          </div>
          <div className="modal-footer fpdi-modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
            <button type="button" className="btn btn-sm btn-success" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
          </div>
        </div>
      </div>
    );
  }
});


var ReadTextModal = React.createClass({
  onConfirmWrapper(evt) {
    var me = this,
      value = me.refs['text-input'].value;
    _.defer(() => {
      me.props.onConfirm(value);
    });
  },
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body">
            <p>{this.props.message}</p>
            <input type='text' className='form-control' ref="text-input" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={this.onConfirmWrapper}>{Messages.get("label.confirm")}</button>
          </div>
        </div>
      </div>
    );
  }
});

var FileUploadModal = React.createClass({
  getInitialState: function () {
    return {
      isLoading: false
    };
  },

  render() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">

          {/* --- CSS AJUSTADO --- */}
          <style>{`
            /* Estilo base do botão Escolher Arquivo */
            .fpdi-custom-file-input::-webkit-file-upload-button {
              visibility: visible;
              margin-right: 15px;
              /* ADICIONADO: Margem esquerda para desgrudar da borda do input */
              margin-left: 2px;
              border: 1px solid #333;
              background: #e6e6e6;
              color: #333;
              padding: 4px 10px;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bold;
              font-size: 11px;
              line-height: 1.2;
              height: auto;
              transition: background 0.2s; /* Suaviza a mudança de cor */
            }

            /* Compatibilidade (Firefox/Outros) */
            .fpdi-custom-file-input::file-selector-button {
              margin-right: 15px;
              margin-left: 2px; /* ADICIONADO */
              border: 1px solid #333;
              background: #e6e6e6;
              color: #333;
              padding: 4px 10px;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bold;
              font-size: 11px;
              line-height: 1.2;
              height: auto;
              transition: background 0.2s;
            }

            /* Efeito HOVER Sutil */
            .fpdi-custom-file-input:hover::-webkit-file-upload-button {
              background: #dcdcdc; /* Cinza levemente mais escuro */
            }
            .fpdi-custom-file-input:hover::file-selector-button {
              background: #dcdcdc;
            }
          `}</style>

          {/* --- HEADER --- */}
          <div className="modal-header fpdi-modal-header" style={{ position: 'relative', borderBottom: '1px solid #e5e5e5', padding: '15px' }}>
            <h4 className="modal-title" id="myModalLabel" style={{ margin: 0, lineHeight: 1.42857143, color: '#333' }}>
                {this.props.title}
            </h4>

            <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '10px',
                  fontSize: '21px',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  color: '#000',
                  textShadow: '0 1px 0 #fff',
                  opacity: '0.2',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none'
                }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* --- BODY --- */}
          <div className="modal-body fpdi-modal-body" style={{ padding: '20px' }}>

            <div style={{ marginBottom: '15px', fontSize: '14px', color: '#333' }}>
                {this.props.message}
            </div>

            {/* INPUT DE ARQUIVO */}
            <div style={{ marginBottom: '10px' }}>
                <input
                  type='file'
                  name="file"
                  className='form-control fpdi-custom-file-input'
                  ref="file-upload-field"
                  id="file-upload-field"
                  accept={this.props.type}
                  // Padding: 10px em todos os lados para garantir espaço
                  style={{ height: 'auto', padding: '10px' }}
                />
            </div>

            <span id="upload-error-span" className="upload-error" style={{ color: '#a94442', display: 'block', marginBottom: '5px' }} />

            {/* INFORMAÇÕES TÉCNICAS */}
            <div className={'fpdi-primary-color'} style={{ color: '#0f4f7c', marginTop: '10px' }}>

              <div style={{ marginBottom: '2px' }}>
                <strong style={{ fontWeight: 'bold' }}>
                    {(Messages.get('label.validFormats') || "Formatos aceitos").replace(/:$/, '')}:
                </strong>
                {" " + (this.props.validSamples ? this.props.validSamples.replaceAll(/,\s*/g, ', ') : '')}
              </div>

              {this.props.maxSize && (
                <div>
                  <strong style={{ fontWeight: 'bold' }}>
                    {(Messages.get('label.FileMaxSize') || "Tamanho máximo permitido").replace(/:$/, '')}:
                  </strong>
                  {" " + (this.props.maxSize / 10e5) + "MB"}
                </div>
              )}
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="modal-footer fpdi-modal-footer" style={{ borderTop: 'none', padding: '15px', textAlign: 'center' }}>

            {this.state.isLoading && (
              <div style={{ marginBottom: '10px', fontStyle: 'italic', color: '#666' }}>
                Carregando seu arquivo...
              </div>
            )}

            <div id="file-upload-progress" className="progress"
                 style={{
                   marginBottom: '0',
                   height: '20px',
                   backgroundColor: '#f5f5f5',
                   border: '1px solid #e3e3e3',
                   borderRadius: '4px',
                   boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)',
                   width: '100%'
                 }}>
              <div className="progress-bar progress-bar-success" style={{ width: '0%', height: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var FileReaderModal = React.createClass({

  render() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            <div>{this.props.message}</div>
            <input type='file' name="file" className='form-control' ref="file-reader-field" id="file-reader-field" accept={this.props.type} onChange={this.props.onSuccess} />
            <span id="upload-error-span" className="upload-error" />
          </div>
          <div className="modal-footer fpdi-modal-footer">
            <div id="file-reader-progress" className="progress" style={{ border: '1px solid #ccc' }}>
              <div className="progress-bar progress-bar-success"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var MediumModal = React.createClass({
  getDefaultProps() {
    return {
      title: null
    };
  },
  render() {
    return (
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

var ExportDocumentModal = React.createClass({
  getInitialState() {
    return {
      checkboxesReady: false,
      retryCount: 0
    };
  },

  componentDidMount() {
    // Verifica se as checkboxes foram renderizadas após o mount
    this.checkCheckboxes();

    // Retry mechanism: verifica novamente após pequenos delays
    this.retryTimer = setTimeout(() => {
      this.checkCheckboxes();
    }, 100);

    this.retryTimer2 = setTimeout(() => {
      this.checkCheckboxes();
    }, 300);

    this.retryTimer3 = setTimeout(() => {
      this.checkCheckboxes();
    }, 600);

    // Usa MutationObserver para detectar quando conteúdo é adicionado ao DOM
    this.setupMutationObserver();
  },

  componentDidUpdate(prevProps) {
    // Se o conteúdo mudou, verifica novamente
    if (prevProps.text !== this.props.text) {
      this.setState({ checkboxesReady: false, retryCount: 0 });
      setTimeout(() => this.checkCheckboxes(), 50);
    }
  },

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.retryTimer2) clearTimeout(this.retryTimer2);
    if (this.retryTimer3) clearTimeout(this.retryTimer3);
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  setupMutationObserver() {
    const container = document.getElementById('container');
    if (container && window.MutationObserver) {
      this.observer = new MutationObserver(() => {
        this.checkCheckboxes();
      });

      this.observer.observe(container, {
        childList: true,
        subtree: true
      });
    }
  },

  checkCheckboxes() {
    // Verifica se existem checkboxes no container
    const container = document.getElementById('container');
    if (container) {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        if (!this.state.checkboxesReady) {
          this.setState({ checkboxesReady: true });
        }
        // Limpa timers quando encontra checkboxes
        if (this.retryTimer) clearTimeout(this.retryTimer);
        if (this.retryTimer2) clearTimeout(this.retryTimer2);
        if (this.retryTimer3) clearTimeout(this.retryTimer3);
      } else if (this.state.retryCount < 5) {
        // Tenta novamente se ainda não houver checkboxes (até 5 tentativas)
        this.setState({ retryCount: this.state.retryCount + 1 });
        setTimeout(() => this.checkCheckboxes(), 300);
      }
    }
  },

  render() {
    const hasContent = this.props.text && (typeof this.props.text === 'string' ? this.props.text.trim() !== '' : true);

    return (
      <div className="modal-dialog modal-md">
        <div className="modal-content" style={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
          <div className="modal-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px 16px 24px',
            borderBottom: 'none'
          }}>
            <h4 className="modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
              {this.props.title}
            </h4>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                color: '#aaa',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
                fontWeight: '300'
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ padding: '8px 24px 24px 24px' }}>
            <form>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="documentTitle" style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '14px', color: '#333' }}>
                    {Messages.get("label.documentTitle")} <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type='text'
                    name="documentTitle"
                    ref="documentTitle"
                    id="documentTitle"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="documentAuthor" style={{ fontWeight: '600', marginBottom: '8px', display: 'block', fontSize: '14px', color: '#333' }}>
                    {Messages.get("label.author")} <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type='text'
                    name="documentAuthor"
                    ref="documentAuthor"
                    id="documentAuthor"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="container" style={{ fontWeight: '600', marginBottom: '12px', display: 'block', fontSize: '14px', color: '#333' }}>
                  {Messages.get("label.includeSectionsDocument")} <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '180px',
                  overflow: 'auto',
                  backgroundColor: '#fff'
                }} id="container">
                  <div style={{ padding: '10px 14px' }}>
                    <style dangerouslySetInnerHTML={{__html: `
                      #container label {
                        display: flex !important;
                        align-items: center !important;
                        margin: 0 !important;
                        font-weight: 600 !important;
                      }
                      #container input[type="checkbox"] {
                        margin-right: 4px !important;
                        margin-left: 0 !important;
                        flex-shrink: 0 !important;
                      }
                    `}} />
                    {hasContent ? this.props.text : (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {Messages.get("label.loading") || "Carregando seções..."}
                        {this.state.retryCount > 0 && (
                          <div style={{
                            marginTop: '10px',
                            fontSize: '12px',
                            color: '#999'
                          }}>
                            Aguarde...
                          </div>
                        )}
                      </div>
                    )}
                    {!this.state.checkboxesReady && hasContent && this.state.retryCount >= 3 && (
                      <div style={{
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        color: '#856404',
                        fontSize: '13px'
                      }}>
                        <strong>Atenção:</strong> Se as seções não aparecerem, tente fechar e abrir o modal novamente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px', fontWeight: '600' }}>
                {Messages.get("label.emptySectionNoExported")}
              </p>
              <p id="paramError" className="exportDocumentError" style={{ color: '#dc3545', fontSize: '14px', marginBottom: '16px' }}></p>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px', fontWeight: '400' }}>
                <span style={{ color: '#dc3545' }}>*</span> {Messages.get("label.requiredFields")}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={this.props.onConfirm}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {Messages.get("label.export")}
                </button>
                <button
                  type="button"
                  data-dismiss="modal"
                  style={{
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #ddd',
                    padding: '10px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '400'
                  }}
                >
                  {Messages.get("label.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
});


var GoalsAttributesModal = React.createClass({
  render() {
    return (
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            {this.props.text}
          </div>
        </div>
      </div>
    );
  }
});

var ImportUsersModal = React.createClass({
  render() {
    return (
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
          </div>
          <div className="modal-body fpdi-modal-body">
            <p id="paramError" className="importUsersWarning"><strong> {Messages.get("label.attention") + ":"}</strong> {Messages.get("label.userTypeAccount")}</p>
            {this.props.text}
            <div id="importUserstModalFooter" name="importUserstModalFooter">
              <p id="paramError" className="importUsersWarning"></p>
              <button type="button" className="btn btn-sm btn-success" onClick={this.props.onConfirm}>{Messages.get("label.import")}</button>
              <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


var ExportPlansModal = React.createClass({
  getInitialState() {
    return {
      selectedPlanIds: [],
      errorMsg: null,
    }
  },

  onCheckboxChange(planId) {
    const { selectedPlanIds } = this.state;
    const newSelectedPlanIds = selectedPlanIds.includes(planId)
      ? _.filter(selectedPlanIds, id => planId !== id)
      : [...selectedPlanIds, planId];

    this.setState({
      selectedPlanIds: newSelectedPlanIds,
    })
  },

  onSelectAll() {
    const { selectedPlanIds } = this.state;
    const { plans } = this.props;

    const newSelectedPlanIds = selectedPlanIds.length < plans.length
      ? _.map(plans, ({ id }) => id)
      : [];

    this.setState({ selectedPlanIds: newSelectedPlanIds });
  },

  onConfirmHandle() {
    const { selectedPlanIds } = this.state;

    if (selectedPlanIds.length === 0) {
      this.setState({
        errorMsg: Messages.get('label.error.mustSelectPlansToExport'),
      });
    } else {
      this.setState({ errorMsg: null });
      this.props.onConfirm(selectedPlanIds);
    }
  },

  render() {
    const { selectedPlanIds, errorMsg } = this.state;
    const { plans } = this.props;

    return (
      <div className="modal-dialog modal-md">
        <div className="modal-content" style={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
          <div className="modal-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px 16px 24px',
            borderBottom: 'none'
          }}>
            <h4 className="modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
              {Messages.get('label.exportPlansConfirmation')}
            </h4>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                color: '#aaa',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
                fontWeight: '300'
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ padding: '8px 24px 24px 24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '400', marginBottom: '12px', display: 'block', fontSize: '14px', color: '#333' }}>
                {Messages.get("label.selectPlansToExport")} <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '180px',
                overflow: 'auto',
                backgroundColor: '#fff'
              }}>
                <div style={{ padding: '10px 14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0, fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      onChange={this.onSelectAll}
                      checked={selectedPlanIds.length === plans.length}
                      style={{ marginRight: '12px', width: '16px', height: '16px', accentColor: '#28a745' }}
                    />
                    Selecionar todos
                  </label>
                </div>
                {plans.map(({ id, name }) => (
                  <div key={"plan-" + id} style={{ padding: '10px 14px', paddingLeft: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', margin: 0, fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={selectedPlanIds.includes(id)}
                        onChange={() => this.onCheckboxChange(id)}
                        style={{ marginRight: '12px', marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#28a745' }}
                      />
                      <span style={{ wordBreak: 'break-word' }}>{name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
              {Messages.get("label.emptySectionNoExported")}
            </p>
            {errorMsg && (
              <p style={{ color: '#dc3545', fontSize: '14px', marginBottom: '16px' }}>{errorMsg}</p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={this.onConfirmHandle}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {Messages.get("label.export")}
              </button>
              <button
                type="button"
                data-dismiss="modal"
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                {Messages.get("label.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var InfoModal = React.createClass({
  getInitialState() {
    return {
      currentModal: 'ForPDI',
      selectedForpdiPermissions: true,
    };
  },

  handleForPDIButtonClick() {
    this.setState({ currentModal: 'ForPDI' });
    this.setState({ selectedForpdiPermissions: true })
  },

  handleForRiscoButtonClick() {
    this.setState({ currentModal: 'ForRisco' });
    this.setState({ selectedForpdiPermissions: false })
  },

  render() {
    const { currentModal, selectedForpdiPermissions } = this.state;
    return (
      <div className="modal-dialog modal-lg" style={{ borderRadius: '15px' }}>
        <div className="modal-content">
          <div
            className="for-primary-color fpdi-nav-label"
            style={{
              display: 'flex',
              justifyContent: 'left',
              marginLeft: '1.5em',
              marginTop: '1.5em',
              fontSize: '22px',
              color: 'rgba(99, 97, 97)',
              fontFamily: 'Open+Sans'
            }}
          >
            <span style={{
              fontFamily: 'Open Sans',
              fontSize: '23.5px',
              fontWeight: 'bolder',
              marginTop: '12px',
            }}
            >
              Hierarquia de perfis</span>
            <div
              className="col-md-2"
              style={{ marginLeft: '30%', display: 'flex' }}
            >
              <AppStyledButton
                text={Messages.get('label.forPdiBrand')}
                title={Messages.get('label.forPdiBrand')}
                onClick={this.handleForPDIButtonClick}
                disabled={selectedForpdiPermissions}
                appName="fpdi"
                style={{
                  marginRight: '10px',
                  backgroundColor: 'none',
                  alignItems: 'right',
                  fontSize: '18px',
                }}
              />
              <AppStyledButton
                text={Messages.get('label.forRiscoBrand')}
                title={Messages.get('label.forRiscoBrand')}
                onClick={this.handleForRiscoButtonClick}
                disabled={!selectedForpdiPermissions}
                appName="frisco"
                style={{ fontSize: '18px' }}
              />
              <div
                style={{
                  height: '80%',
                  marginTop: '5px',
                  borderLeft: '1px solid rgba(128, 128, 128, 0.5)',
                  backgroundColor: '1px solid rgba(128, 128, 128, 0.5)',
                  marginLeft: '20px',
                }}
              />
              <button
                className="mdiClose mdi mdi-close pointer"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.085)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '5px',
                  marginTop: '10px',
                  width: '30px',
                  height: '30px',
                  marginLeft: '1em',
                  color: 'rgba(146,100,221,255)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                data-dismiss="modal"
              ></button>
            </div>
          </div>
          {currentModal === 'ForPDI' && (
            <div className="modal-body" style={{ padding: '0 24px 24px 24px' }}>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '15px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Administrador
              </p>
              <p>
                Tem a permissão de realizar todas as funcionalidades
                disponíveis, independente da atuação no item a ser tratado.
              </p>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '30px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Gerente
              </p>
              <p style={{ fontSize: '14px' }}>
                Possui permissão intermediária em relação ao Administrador e
                ao Colaborador.
              </p>
              <p style={{ fontSize: '14px', marginTop: '16px', fontWeight: 'bold' }}>
                Para o PDI
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Realiza gestão de elementos orçamentários.</li>
                <li>De maneira geral, tem a possibilidade de visualizar todos os itens
                  disponíveis, gerar relatórios, adicionar aos favoritos, duplicar estrutura e editar
                  informações. Excluir e gerar metas.</li>
                <li>Enquanto a atuação é de "Gestor", além dos itens padrões, tem possibilidade de exclusão
                  do item, adição e edição de orçamentos, conclusão e reabertura
                  de metas, adição e exclusão de arquivos, visualização e edição
                  de status de planos de ação.</li>
                <li>Mesmo com a atuação como "Responsável técnico" da meta, o gerente permanece com as
                  permissões acima.</li>
                <li>Vale ressaltar que a árvore de plano de metas
                  possui hierarquia, sendo assim, quando um gerente é Gestor de um
                  nível, ele passa a receber as permissões para os níveis abaixo.</li>
                <li>Tem a permissão de extrair relatórios.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                <span style={{ color: '#FF0000' }}>Atenção:</span> Quando o gerente não for Gestor, apenas visualizará os itens, o que permite que se tenha vários perfis de gerente por campus.
              </p>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '30px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Colaborador
              </p>
              <p style={{ fontSize: '14px' }}>
                É o menor nível de atuação dentro do sistema. Possuindo como
                padrão principal somente a visualização das informações.
              </p>
              <p style={{ fontSize: '14px', marginTop: '16px', fontWeight: 'bold' }}>
                Para o PDI
              </p>
              <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
                <li>De maneira geral tem a possibilidade de visualizar todos os itens disponíveis e adicionar aos favoritos.</li>
                <li>Para Indicador, visualizar todos os status e editar itens de plano de ação que está como responsável técnico, além de realizar buscas e exportar csv.</li>
                <li>Para metas, como "Responsável técnico", permite a alteração das informações dos campos "Alcançado" e "Justificativa", e gestão dos anexos.</li>
                <li>Não tem a permissão de extrair relatórios.</li>
              </ul>
            </div>
          )}
          {currentModal === 'ForRisco' && (
            <div className="modal-body" style={{ padding: '0 24px 24px 24px' }}>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '15px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Administrador
              </p>
              <p>
                Tem a permissão de realizar todas as funcionalidades
                disponíveis, independente da atuação no item a ser tratado.
              </p>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '30px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Gerente
              </p>
              <p style={{ fontSize: '14px' }}>
                Possui permissão intermediária em relação ao Administrador e
                ao Colaborador.
              </p>
              <p style={{ fontSize: '14px', marginTop: '16px', fontWeight: 'bold' }}>
                Para o RISCO
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Possui permissão para atualização dos itens
                  relacionados a processos e riscos, propriamente ditos. Podendo também mover, replicar, arquivar e excluir riscos. Para os Itens de menu
                  políticas e plano de gestão de risco, somente tem a possibilidade de visualização.</li>
                <li>Para os itens de menu políticas e plano de gestão de risco, somente tem
                  a possibilidade de visualização.</li>
                <li>Para os itens Unidade e Subunidade, possuem como padrão visualização das informações.</li>
                <li>Porém, enquanto a atuação é de "Responsável técnico", da unidade ou subunidade, além dos itens padrões, tem a possibilidade de edição das informações gerais, com exceção do campo "responsável técnico".</li>
                <li>Tem a permissão de extrair relatórios.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                <span style={{ color: '#FF0000' }}>Atenção:</span> A atuação como gestor somente difere, quanto aos itens padrões, em relação às notificações recebidas referentes às atualizações e monitoramento (validar notificações).
              </p>
              <div style={{
                borderBottom: '1px solid rgba(128, 128, 128, 0.4)',
                margin: '30px 0 20px 0',
                width: '100%'
              }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>
                Colaborador
              </p>
              <p style={{ fontSize: '14px' }}>
                É o menor nível de atuação dentro do sistema. Possuindo como
                padrão principal somente a visualização das informações.
              </p>
              <p style={{ fontSize: '14px', marginTop: '16px', fontWeight: 'bold' }}>
                Para o RISCO
              </p>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Possui permissão padrão somente para visualização das informações.</li>
                <li>Enquanto a atuação é de "Responsável técnico", da unidade ou subunidade, além da visualização padrão, tem a possibilidade de edição das informações gerais, com exceção do campo "responsável técnico".</li>
                <li>Enquanto a atuação é de "Responsável técnico" de um risco, consegue editar as informações gerais, com exceção do nome do risco, código de identificação do risco, gestor e responsável técnico.</li>
                <li>Permite a criação e gestão dos itens das abas ações de prevenção, monitoramento, incidentes e contingenciamento.</li>
                <li>Tem a permissão de extrair relatórios.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
});

var GraphHistory = React.createClass({
  render() {
    return (
      <div className="modal-dialog modal-graph modal-md">
        <div className="modal-content graph">
          <div className="frisco-modal-history">
            <span style={{ "display": "inline-block" }}>
              <h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
            </span>
            <button type="button" className="mdi mdi-close-circle close-modal cursorPointer" data-dismiss="modal" />
          </div>

          <hr className="divider" />
          <div className="modal-body fpdi-modal-body"> {this.props.text} </div>
        </div>
      </div>
    );
  }
});

var TextAreaModal = React.createClass({
  getInitialState() {
    return {
      value: this.props.value,
    }
  },

  componentWillReceiveProps(newProps) {
    const { value } = newProps;
    this.setState({ value });
  },

  render() {
    return (
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <div className="modal-body fpdi-modal-body">
              <VerticalInput
                fieldDef={{
                  name: "new-monitor-report",
                  type: "textarea",
                  rows: "10",
                  currValue: this.state.value,
                  onChange: (e) => {
                    this.setState({ value: e.target.value });
                    this.props.onChange(e);
                  },
                }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-info" data-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>
    )
  },
});

var Modal = {
  $el: EL,
  $nc: NC,
  _root: modalRoot,
  _ncRoot: modalNoCloseRoot,
  _lastContent: null,
  _lastNoCloseContent: null,

  renderModal(content, options = {}) {
    const {
      useNoClose = false,
      canClose = true,
      backdrop = true,
      onClose = null,
      theme = DEFAULT_MODAL_THEME,
    } = options;

    const root = useNoClose ? this._ncRoot : this._root;
    if (!root) return;

    const closeHandler = () => {
      this.hide();
      if (typeof onClose === 'function') onClose();
    };

    const payload = (
      <LegacyModalWrapper
        canClose={canClose}
        backdrop={backdrop}
        onClose={canClose ? closeHandler : undefined}
        theme={theme}
      >
        {content}
      </LegacyModalWrapper>
    );

    if (useNoClose) {
      this._lastNoCloseContent = { content, options: { useNoClose, canClose, backdrop, onClose, theme } };
    } else {
      this._lastContent = { content, options: { useNoClose, canClose, backdrop, onClose, theme } };
    }

    root.render(payload);
  },

  hide(cb) {
    if (this._root) this._root.render(<></>);
    if (this._ncRoot) this._ncRoot.render(<></>);
    if (typeof cb === 'function') _.defer(cb);
  },

  show() {
    if (this._lastContent) {
      const { content, options } = this._lastContent;
      this.renderModal(content, options);
    }
  },

  detailsModal(title, Components) {
    this.renderModal(
      <MediumModal title={title}>
        {Components}
      </MediumModal>
    );
  },
  alert(title, msg) {
    this.renderModal(<AlertModal title={title} message={msg} />);
  },
  acceptTerms(title, msg, cb) {
    this.renderModal(
      <NoClosableModal onConfirm={cb} confirmTitle={title} message={msg} />,
      { useNoClose: true, canClose: false }
    );
  },
  confirm(title, msg, cb) {
    this.renderModal(
      <ConfirmModal onConfirm={cb} confirmTitle={title} message={msg} />
    );
  },
  confirmCustom(cb, text, cd) {
    this.renderModal(
      <ConfirmModalCustom onConfirm={cb} text={text} onCancel={cd} />
    );
  },

  confirmConviteUserCustom(text) {
    this.renderModal(
      <ConfirmConviteUser text={text} />
    );
  },

  confirmCancelCustom(cb, text, cd) {
    this.renderModal(
      <CancelModalCustom onConfirm={cb} text={text} onCancel={cd} />
    );
  },

  deleteConfirm(cb) {
    this.renderModal(
      <DeleteConfirmModal onConfirm={cb} />
    );
  },
  deleteConfirmCustom(cb, text) {
    this.renderModal(
      <DeleteConfirmModalCustom onConfirm={cb} text={text} />
    );
  },
  completeGoalCustom(cb, text) {
    this.renderModal(
      <ConcludeGoalModalCustom onConfirm={cb} text={text} />
    );
  },
  readText(title, msg, cb) {
    this.renderModal(
      <ReadTextModal title={title} message={msg} onConfirm={cb} />
    );
  },

  feedbackPost() {
    this.renderModal(
      <MediumModal title={Messages.get("label.sendFeedback")}>
        <FeedbackPost
          onCancel={this.hide.bind(this)}
          onSubmit={this.hide.bind(this)}
        />
      </MediumModal>
    );
  },
  showInfoModal(title, text) {
    this.renderModal(
      <InfoModal title={title} text={text} />
    );
  },
  reportProblem() {
    this.renderModal(
      <MediumModal title={Messages.get("label.reportIssue")}>
        <ReportProblem
          onCancel={this.hide.bind(this)}
          onSubmit={this.hide.bind(this)}
        />
      </MediumModal>
    );
  },

  uploadFile(title, msg, url, fileType, typesBlocked, onSuccess, onFailure, validSamples, maxSize) {
    var me = this;
    var format = "";
    var sizeExceeded = false;
    var typeViolation = false;
    if (maxSize) maxSize *= 10e5;

    const apiJoin = (path) => {
      const base = (window.BACKEND_URL || "").replace(/\/+$/, "");
      const p = (path || "").replace(/^\/+/, "");
      return `${base}/${p}`.replace(/\/api\/api\//g, "/api/");
    };
    const setBar = (pct, text) => {
      const clamped = Math.max(0, Math.min(100, Math.round(pct)));
      const $bar = $('#file-upload-progress .progress-bar');
      $bar.css('width', clamped + '%')
        .attr('aria-valuenow', clamped)
        .text(text ? `${clamped}% — ${text}` : `${clamped}%`);
    };

    let _soft = 0, _serverPct = 0, _stage = "ENFILEIRADO", _timer = null;

    const startServerPolling = (jobId) => {
      const statusUrl = apiJoin(`company/fbkupload/status/${jobId}`);
      const POLL_MS = 3000;

      $('#file-upload-progress .progress-bar').addClass('progress-bar-striped active');
      _soft = Math.max(_soft, 10);
      setBar(_soft, _stage);

      const smooth = () => {
        const cap = 90, step = 3;
        if (_soft < cap) { _soft = Math.min(cap, _soft + step); setBar(_soft, _stage); }
      };

      const hit = () => {
        $.ajax({
          method: "GET",
          url: statusUrl,
          xhrFields: { withCredentials: true },
          success: (st) => {
            if (!st) return;
            _serverPct = (typeof st.progress === "number") ? st.progress : _serverPct;
            _stage = st.stage || _stage || "PROCESSANDO";

            _soft = Math.max(_soft, _serverPct);
            const display = st.success ? 100 : Math.min(90, Math.max(_soft, _serverPct));
            setBar(display, _stage);

            if (st.success) {
              clearInterval(_timer); _timer = null;
              $('#file-upload-progress .progress-bar').removeClass('active progress-bar-striped');
              setBar(100, "PRONTO");
              if (typeof onSuccess === 'function') onSuccess.call(me, { success: true, jobId, phase: 'server-done' });
              return;
            }
            if (st.stage === "ERRO") {
              clearInterval(_timer); _timer = null;
              $('#file-upload-progress .progress-bar').removeClass('active progress-bar-striped');
              if (typeof onFailure === 'function') onFailure.call(me, { message: st.message || "Falha na importação." });
              return;
            }

            smooth();
          },
          error: (xhr) => {
            if (xhr && (xhr.status === 401 || xhr.status === 403)) {
              clearInterval(_timer); _timer = null;
              if (typeof onFailure === 'function') onFailure.call(me, { message: "Acesso negado ao status da importação." });
            }
          }
        });
      };

      hit();
      _timer = setInterval(hit, POLL_MS);
    };

    const componentRef = React.createRef();

    this.renderModal(
      <FileUploadModal
        ref={componentRef}
        title={title}
        message={msg}
        type={fileType}
        validSamples={validSamples}
        maxSize={maxSize}
      />
    );

    const setLoading = (value) => {
      if (componentRef.current && typeof componentRef.current.setState === 'function') {
        componentRef.current.setState({ isLoading: value });
      }
    };

    const setErrorMessage = (text) => {
      const el = document.getElementById('upload-error-span');
      if (el) el.innerHTML = text;
    };

    setErrorMessage("");

    var uploadOptions = {
      url: url,
      dataType: 'json',
      beforeSend: function (xhr, opts) {
        setLoading(true);

        format = this.files[0].name.substring(this.files[0].name.lastIndexOf(".") + 1);
        if ((!(this.files[0].type.toLowerCase().match(fileType)) && !(format.toLowerCase().match(fileType)))
          || format.toLowerCase().match(typesBlocked)) {
          if (!this.files[0].type.toLowerCase().match(fileType) || this.files[0].type.toLowerCase().match(typesBlocked))
            format = this.files[0].type.split("/")[1] || "";
          typeViolation = true;
          xhr.abort();
        } else if (maxSize && this.files[0].size > maxSize) {
          sizeExceeded = true;
          xhr.abort();
        }
        me.fileName = this.files[0].name;
      },
      done: function (evt, opts) {
        setLoading(false);

        const xhr = opts?.jqXHR;
        const status = xhr?.status;
        const resp = xhr?.responseJSON;

        if ((status === 202 && resp && resp.jobId) || (resp && resp.jobId)) {
          setBar(0, "ENFILEIRADO");
          startServerPolling(resp.jobId);
          return;
        }

        if (resp && resp.success === true) {
          if (typeof onSuccess === 'function') onSuccess.call(me, { ...resp, phase: 'legacy-done' });
          return;
        }

        if (typeof onFailure === 'function') {
          onFailure.call(me, resp || { message: "Falha na importação (resposta inesperada)." });
        }
      },
      fail: function (evt, opts) {
        setLoading(false);

        if (typeViolation) {
          setErrorMessage(
            "O formato " + format + " não é válido.<br>" + (validSamples ? Messages.get("label.examplesValidFormats") + ": " + validSamples : "")
          );
        } else if (sizeExceeded) {
          setErrorMessage(
            "Tamanho máximo excedido, o tamanho máximo é " + maxSize / 10e5 + "MB"
          );
        } else if (typeof onFailure === 'function') {
          onFailure.call(me, opts?.jqXHR?.responseJSON || { message: "Falha no upload." });
        }
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        var capped = Math.min(progress, 99);
        setBar(capped, "ENVIANDO ARQUIVO");
      }
    };

    const bindFileUpload = (retries = 5) => {
      const $field = $('#file-upload-field');
      if ($field.length === 0) {
        if (retries > 0) {
          setTimeout(() => bindFileUpload(retries - 1), 30);
        }
        return;
      }

      $field.fileupload(uploadOptions)
        .prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
    };

    // React 18 render é assíncrono; aguarda o campo existir antes de registrar o plugin.
    setTimeout(() => bindFileUpload(), 0);
  },


  readFile(title, msg, fileType, onSuccess) {
    this.renderModal(
      <FileReaderModal title={title} message={msg} type={fileType} onSuccess={onSuccess} />
    );

  },

  exportDocument(title, text, cb) {
    this.renderModal(
      <ExportDocumentModal title={title} text={text} onConfirm={cb} />
    );
  },

  selectGoalsAttributes(title, text, cb) {
    this.renderModal(
      <GoalsAttributesModal title={title} text={text} onConfirm={cb} />
    );
  },

  importUsers(title, text, cb) {
    this.renderModal(
      <ImportUsersModal title={title} text={text} onConfirm={cb} />
    );
  },

  exportPlanMacros(plans, onConfirm) {
    this.renderModal(
      <ExportPlansModal plans={plans} onConfirm={onConfirm} />
    );
  },

  GraphHistory(title, text) {
    this.renderModal(
      <GraphHistory title={title} text={text} />
    );

  },

  MultiSelectMod(units, selectedUnits, unitChangeHandler) {
    this.renderModal(
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <div className="modal-body fpdi-modal-body" style={{ width: "50%" }}>
              <ReactMultiSelectCheckboxes
                className="unit-mult-select"
                placeholderButtonLabel="Selecione uma ou mais"
                options={units}
                defaultValue={selectedUnits}
                onChange={unitChangeHandler}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Fechar</button>

            </div>
          </div>
        </div>
      </div>
    );

  },

  TextArea(value, onChange) {
    this.renderModal(
      <TextAreaModal value={value} onChange={onChange} />
    );

  },

  ShowText(data_value) {
    this.renderModal(
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header fpdi-modal-header">
            <div className="modal-body fpdi-modal-body" style={{ overflowWrap: "break-word" }}>
              <span>{data_value}</span>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    );

  },
};

export default Modal;
