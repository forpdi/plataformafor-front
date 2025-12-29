import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import Messages from 'forpdi/src/Messages';

class SelectBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      maxTextLength: 15,
    };
  }

  componentDidMount() {
    this.updateMaxTextLength();
    window.addEventListener('resize', this.updateMaxTextLength);
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('resize', this.updateMaxTextLength);
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.updateMaxTextLength();
        }
      });
    });

    if (this.selectRef) {
      this.observer.observe(this.selectRef);
    }
  }

  updateMaxTextLength = () => {
    const ref = this.selectRef;
    if (ref) {
      const selectWidth = ref.clientWidth;
      if (!selectWidth) {
        this.createObserver();
      }
      const avgCharWidth = 9;
      const maxLength = Math.floor(selectWidth / avgCharWidth) - 1;
      this.setState({ maxTextLength: maxLength });
    }
  }

  renderLabel() {
    const { label, id, required } = this.props;
    return label && (
      <Label htmlFor={id} required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  setSelectRef = (element) => {
    this.selectRef = element;
  };

  render() {
    const {
      id,
      name,
      label,
      options,
      value,
      onChange,
      className,
      style,
      containerStyle,
      errorMsg,
      showErrorMsg,
      disabled,
      showChooseOption,
      chooseOptionLabel,
      enableChooseOptionSelection,
      optionLabelName,
      optionValueName,
    } = this.props;
    const { theme } = this.context;
    const { maxTextLength } = this.state;
    const textClassName = value === '' ? 'placeholder-color' : `${theme}-text-color`;

    return (
      <InputContainer className={className} style={containerStyle}>
        {label && this.renderLabel()}
        <ErrorControl errorMsg={errorMsg} showErrorMsg={showErrorMsg}>
          <select
            name={name}
            id={id}
            value={value}
            onChange={onChange}
            className={`select-box ${textClassName} ${theme}-border-color-1`}
            style={style}
            disabled={disabled}
            ref={this.setSelectRef}
          >
            {
              showChooseOption && (
                <option
                  key="option-placeholder"
                  className={`${theme}-text-color`}
                  value=""
                  disabled={!enableChooseOptionSelection}
                >
                  {chooseOptionLabel}
                </option>
              )
            }
            {
              _.map(options, option => (
                <option
                  key={`${option[optionValueName]}`}
                  value={option[optionValueName]}
                  className={`${theme}-text-color`}
                  title={option[optionLabelName].length > maxTextLength ? option[optionLabelName] : null}
                >
                  {cutPhrase(String(option[optionLabelName]), maxTextLength)}
                </option>
              ))
            }
          </select>
        </ErrorControl>
      </InputContainer>
    );
  }
}

SelectBox.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.bool,
  ]),
  errorMsg: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    }),
  ),
  label: PropTypes.node,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  showChooseOption: PropTypes.bool,
  chooseOptionLabel: PropTypes.string,
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
  showErrorMsg: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  enableChooseOptionSelection: PropTypes.bool,
};

SelectBox.defaultProps = {
  value: '',
  errorMsg: '',
  showErrorMsg: true,
  options: [],
  label: null,
  id: '',
  name: '',
  style: {},
  containerStyle: {},
  showChooseOption: false,
  chooseOptionLabel: Messages.get('label.select'),
  optionLabelName: 'name',
  optionValueName: 'id',
  required: false,
  className: '',
  disabled: false,
  enableChooseOptionSelection: false,
};

SelectBox.contextTypes = {
  theme: PropTypes.string,
};

export default SelectBox;
