import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import TertiaryButton from 'forpdi/src/components/buttons/TertiaryButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';
import ProgressBar from 'forpdi/src/components/ProgressBar';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import FileStore from 'forpdi/src/forpdi/core/store/File';
import Messages from 'forpdi/src/Messages';
import { validationFile, validateImageSize } from 'forpdi/src/validations/validationFile';

class FileUploadModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      progress: 0,
      file: {},
      errors: {},
    };
  }

  componentDidMount() {
    FileStore.on('uploaded', (response) => {
      this.onSuccessHandler(response);
    }, this);
  }

  componentWillUnmount() {
    FileStore.off(null, null, this);
  }

  onProgressHandler = ({ percent }) => {
    this.setState({ progress: percent });
  }

  onSuccessHandler = ({ message }) => {
    const { onSuccess } = this.props;
    const { file } = this.state;

    onSuccess(message, { fileName: file.name });
    Modal.hide();
  }

  beforeUpload = (file) => {
    const { acceptedFiles, maxSizeMB, acceptedImageSize } = this.props;

    const { errors, hasErrors } = validationFile(file, acceptedFiles, maxSizeMB);

    if (hasErrors) {
      this.setState({ errors });
      return false;
    }

    if (acceptedImageSize) {
      const promise = new Promise((resolve, reject) => {
        validateImageSize(
          file,
          acceptedImageSize,
          () => {
            this.setState({ errors: {}, file });
            resolve();
          },
          (imageSizeErrors) => {
            this.setState({ errors: { ...imageSizeErrors } });
            reject();
          },
        );
      });

      return promise;
    }

    this.setState({
      errors: {},
      file,
    });

    return true;
  }

  uploadFile = ({ target }) => {
    const file = target.files[0];

    if (this.beforeUpload(file)) {
      FileStore.dispatch({
        action: FileStore.ACTION_UPLOAD,
        data: {
          file,
          onProgressHandler: this.onProgressHandler,
        },
      });
    }
  }

  renderHeader() {
    return (
      <div className="modal-header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SecondaryTitle
            style={{ textTransform: 'capitalize', fontWeight: '600', marginLeft: '5px' }}
          >
            {Messages.get('label.insertAttachment')}
          </SecondaryTitle>
        </div>
      </div>
    );
  }

  renderBody() {
    const { theme } = this.context;
    const { errors, file, progress } = this.state;
    const { acceptedFiles, maxSizeMB } = this.props;

    return (
      <div className="modal-body">
        <div style={{ marginBottom: '1rem' }}>
          <ErrorControl errorMsg={errors.errorMsg}>
            <div
              className={`${theme}-border-color-1`}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="file"
                id="file-upload"
                accept={acceptedFiles}
                onChange={this.uploadFile}
                style={{ display: 'none' }}
              />
              <TertiaryButton
                title={Messages.get('label.selectFile')}
                text={Messages.get('label.selectFile')}
                icon="upload"
                onClick={() => {
                  document.getElementById('file-upload').click();
                }}
              />
              <Text
                style={{ marginLeft: '10px' }}
                maxLength={30}
                text={file ? file.name : ''}
              />
            </div>
            <div>
              <Text style={{ marginLeft: '10px' }}>
                <b className={`${theme}-primary-color`}>
                  {`${Messages.get('label.validFormats')} `}
                </b>
                { acceptedFiles.replaceAll(/,\s*/g, ', ') }
              </Text>
              <Text style={{ marginLeft: '10px' }} className={`${theme}-primary-color`}>
                <b className={`${theme}-primary-color`}>
                  {`${Messages.get('label.FileMaxSize')}: `}
                </b>
                { `${maxSizeMB}MB` }
              </Text>
            </div>
          </ErrorControl>
        </div>
        <ProgressBar percent={progress} />
      </div>
    );
  }

  render() {
    return (
      <Modal>
        {this.renderHeader()}
        {this.renderBody()}
      </Modal>
    );
  }
}

FileUploadModal.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  acceptedFiles: PropTypes.string,
  maxSizeMB: PropTypes.number,
  acceptedImageSize: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
};

FileUploadModal.defaultProps = {
  acceptedFiles: 'gif,jpg,jpeg,jpg2,jp2,bmp,tiff,png,ai,psd,svg,svgz,pdf',
  maxSizeMB: 2,
  acceptedImageSize: null,
};

FileUploadModal.contextTypes = {
  theme: PropTypes.string,
};

export default FileUploadModal;
