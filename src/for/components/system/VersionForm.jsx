import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';

import Messages from 'forpdi/src/Messages';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import RichTextArea from 'forpdi/src/components/inputs/RichTextArea';
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton';
import appVersion from 'forpdi/src/enums/appVersion';

class VersionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showVersion: appVersion.forVersion,
    };
  }

  onDateChange = (releaseDate) => {
    const { onChange, version } = this.props;
    onChange({
      ...version,
      releaseDate,
    });
  }

  setFor = () => {
    this.setState({ showVersion: appVersion.forVersion });
  }

  setFpdi = () => {
    this.setState({ showVersion: appVersion.pdiVersion });
  }

  setFrisco = () => {
    this.setState({ showVersion: appVersion.riscoVersion });
  }

  onChangeHandler = (e) => {
    const { onChange, version } = this.props;
    const { name, value } = e.target;

    onChange({
      ...version,
      [name]: value,
    });
  }

  renderNumberDate() {
    const { errors, version } = this.props;
    const { numberVersion, releaseDate } = version;
    return (
      <InputContainer className="row">
        <div className="col col-sm-10">
          <TextField
            id="numberVersion"
            name="numberVersion"
            label={Messages.get('label.numberVersion')}
            onChange={this.onChangeHandler}
            value={numberVersion}
            errorMsg={errors.numberVersion}
            maxLength={128}
            required
          />
        </div>
        <div className="col col-sm-2">
          <DatePicker
            id="releaseDate"
            label={Messages.get('label.date')}
            onChange={this.onDateChange}
            value={releaseDate}
            errorMsg={errors.releaseDate}
            required
          />
        </div>
      </InputContainer>
    );
  }

  renderButtons() {
    const { showVersion } = this.state;
    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <AppStyledButton
            text={Messages.get('label.forPlataformaForLogo')}
            title={Messages.get('label.forPlataformaForLogo')}
            onClick={this.setFor}
            appName="for"
            style={{ marginRight: '10px', backgroundColor: 'none' }}
            disabled={showVersion === appVersion.forVersion}
          />
          <AppStyledButton
            text={Messages.get('label.forPdiBrand')}
            title={Messages.get('label.forPdiBrand')}
            onClick={this.setFpdi}
            appName="fpdi"
            style={{ marginRight: '10px', backgroundColor: 'none' }}
            disabled={showVersion === appVersion.pdiVersion}
          />
          <AppStyledButton
            text={Messages.get('label.forRiscoBrand')}
            title={Messages.get('label.forRiscoBrand')}
            onClick={this.setFrisco}
            appName="frisco"
            style={{ backgroundColor: 'none' }}
            disabled={showVersion === appVersion.riscoVersion}
          />
        </div>
      </InputContainer>
    );
  }

  renderRichText() {
    const { version, errors } = this.props;
    const {
      infoFor, infoPdi, infoRisco,
    } = version;
    const { showVersion } = this.state;
    return (
      <InputContainer className="row">
        <div className="col col-sm-12">
          {showVersion === appVersion.forVersion && (
            <RichTextArea
              id="infoFor"
              name="infoFor"
              onChange={this.onChangeHandler}
              errorMsg={errors.richText}
              value={infoFor}
              maxLength={4000}
              isSimple
            />
          )}
          {showVersion === appVersion.pdiVersion && (
            <RichTextArea
              id="infoPdi"
              name="infoPdi"
              onChange={this.onChangeHandler}
              errorMsg={errors.richText}
              value={infoPdi}
              maxLength={4000}
              isSimple
            />
          )}
          {showVersion === appVersion.riscoVersion && (
            <RichTextArea
              id="infoRisco"
              name="infoRisco"
              onChange={this.onChangeHandler}
              errorMsg={errors.richText}
              value={infoRisco}
              maxLength={4000}
              isSimple
            />
          )}
        </div>
      </InputContainer>
    );
  }

  render() {
    return (
      <div>
        {this.renderNumberDate()}
        {this.renderButtons()}
        {this.renderRichText()}
      </div>
    );
  }
}

VersionForm.propTypes = {
  version: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

VersionForm.defaultProps = {
  errors: {},
};

export default VersionForm;
