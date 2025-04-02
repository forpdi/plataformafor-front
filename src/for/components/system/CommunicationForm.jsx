import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';

import Messages from 'forpdi/src/Messages';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import TextArea from 'forpdi/src/components/inputs/TextArea';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';

class CommunicationForm extends React.Component {
  onChangeHandler = (e) => {
    const { onChange, communication } = this.props;
    const { name, value } = e.target;

    onChange({
      ...communication,
      [name]: value,
    });
  }

  onValidityBeginChange = (validityBegin) => {
    const { onChange, communication } = this.props;

    onChange({
      ...communication,
      validityBegin,
    });
  }

  onValidityEndChange = (validityEnd) => {
    const { onChange, communication } = this.props;

    onChange({
      ...communication,
      validityEnd,
    });
  }

  renderTitle() {
    const { communication, errors } = this.props;
    const { title } = communication;
    return (
      <InputContainer className="row">
        <div className="col col-sm-12">
          <TextField
            id="title"
            name="title"
            label={Messages.get('label.title')}
            onChange={this.onChangeHandler}
            value={title}
            errorMsg={errors.title}
            maxLength={50}
            required
          />
        </div>
      </InputContainer>
    );
  }

  renderMessage() {
    const { communication, errors } = this.props;
    const { message } = communication;
    return (
      <InputContainer className="row">
        <div className="col col-sm-12">
          <TextArea
            id="message"
            name="message"
            label={Messages.get('label.msg')}
            onChange={this.onChangeHandler}
            errorMsg={errors.message}
            value={message}
            maxLength={1000}
            required
          />
        </div>
      </InputContainer>
    );
  }

  renderValidity() {
    const { communication, errors } = this.props;
    const { validityBegin, validityEnd } = communication;

    return (
      <InputContainer className="row">
        <div className="col col-sm-2">
          <DatePicker
            id="validityBegin"
            label={Messages.get('label.dateBegin')}
            onChange={this.onValidityBeginChange}
            value={validityBegin}
            errorMsg={errors.validityBegin}
            required
          />
        </div>
        <div className="col col-sm-2">
          <DatePicker
            id="validityEnd"
            label={Messages.get('label.dateEnd')}
            onChange={this.onValidityEndChange}
            value={validityEnd}
            errorMsg={errors.validityEnd}
          />
        </div>
      </InputContainer>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderMessage()}
        {this.renderValidity()}
      </div>
    );
  }
}

CommunicationForm.propTypes = {
  communication: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

CommunicationForm.defaultProps = {
  errors: {},
};

export default CommunicationForm;
