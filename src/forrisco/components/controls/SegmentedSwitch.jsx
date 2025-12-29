import React from 'react';
import PropTypes from 'prop-types';

/**
 * SegmentedSwitch
 * - Controle segmentado reutilizável (tipo "pill switch")
 * - Visual: cápsula cinza; segmento ativo branco com borda/sombra
 *
 * Props principais:
 * - options: [{ id: string, label: string, icon?: string }]
 * - value: id selecionado (string)
 * - onChange: (newId) => void
 *
 * Extras:
 * - minWidth: largura mínima por segmento (ex.: 120)
 * - shellBg: cor do fundo da cápsula
 * - activeColor: cor do texto do segmento ativo
 * - textColor: cor do texto inativo
 * - borderColor: cor da borda do segmento ativo
 * - className/style: para ajustes finos externos
 * - ariaLabel: acessibilidade
 */
class SegmentedSwitch extends React.PureComponent {
  getColors = ({
    activeColor, shellBg, borderColor, textColor,
  }) => ({
    primary: activeColor || '#6C63FF',
    shellBg: shellBg || '#EFEFEF',
    white: '#FFFFFF',
    border: borderColor || '#E5E7EB',
    text: textColor || '#3F3F46',
    muted: '#6B7280',
  });

  shellStyle = (colors, externalStyle) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    background: colors.shellBg,
    borderRadius: 28,
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
    ...externalStyle,
  });

  btnStyle = (selected, colors, minWidth) => ({
    background: selected ? colors.white : 'transparent',
    color: selected ? colors.primary : colors.muted,
    border: `1px solid ${selected ? colors.border : 'transparent'}`,
    borderRadius: 22,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: selected ? 600 : 500,
    lineHeight: 1,
    cursor: 'pointer',
    minWidth: minWidth || 120,
    textAlign: 'center',
    transition: 'all 150ms ease',
    boxShadow: selected ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  });

  handleKeyDown = (e) => {
    const { options, value, onChange } = this.props;
    if (!options || options.length === 0) return;

    const currentIndex = Math.max(0, options.findIndex(o => o.id === value));

    if (e.key === 'ArrowRight') {
      const next = (currentIndex + 1) % options.length;
      onChange(options[next].id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = (currentIndex - 1 + options.length) % options.length;
      onChange(options[prev].id);
      e.preventDefault();
    }
  };

  render() {
    const {
      options,
      value,
      onChange,
      className,
      ariaLabel,
      style,
      minWidth,
      activeColor,
      shellBg,
      borderColor,
      textColor,
    } = this.props;

    const colors = this.getColors({
      activeColor, shellBg, borderColor, textColor,
    });

    return (
      <div
        className={className}
        style={this.shellStyle(colors, style)}
        role="tablist"
        aria-label={ariaLabel || 'Alternador'}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
      >
        {options.map((opt) => {
          const selected = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              style={this.btnStyle(selected, colors, minWidth)}
              onClick={() => onChange(opt.id)}
              title={opt.label}
            >
              {opt.icon ? (
                <img src={opt.icon} alt="" style={{ height: 16, width: 16 }} />
              ) : null}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
}

SegmentedSwitch.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,

  minWidth: PropTypes.number,
  shellBg: PropTypes.string,
  activeColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,

  className: PropTypes.string,
  style: PropTypes.shape({}),
  ariaLabel: PropTypes.string,
};

SegmentedSwitch.defaultProps = {
  minWidth: 120,
  shellBg: '#EFEFEF',
  activeColor: '#6C63FF',
  textColor: '#3F3F46',
  borderColor: '#E5E7EB',
  className: '',
  style: {},
  ariaLabel: 'Alternador',
};

export default SegmentedSwitch;
