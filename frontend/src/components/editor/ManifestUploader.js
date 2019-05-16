import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Grid, Icon } from 'patternfly-react';
import { helpers } from '../../common/helpers';
import UploadUrlModal from '../modals/UploadUrlModal';
import { reduxConstants } from '../../redux';
import { normalizeYamlOperator, EDITOR_STATUS, sectionsFields } from '../../pages/OperatorEditorPage/editorPageUtils';

const validFileTypes = ['.yaml'];

class ManifestUploader extends React.Component {
  state = {
    uploads: [],
    dragOver: false,
    uploadUrlShown: false
  };

  componentDidMount() {
    this.setState({ advancedUpload: helpers.advancedUploadAvailable() });
  }

  validateUpload = () => true;

  applyUpload = upload => {
    const { operator, onUpdate } = this.props;

    let updatedOperator = {};
    try {
      updatedOperator = normalizeYamlOperator(upload.contents) || {};
    } catch (e) {
      upload.status = (
        <span className="oh-operator-editor-upload__uploads__status">
          <Icon type="fa" name="error-circle" />
          <span className="oh-operator-editor-upload__uploads__status__message">Parsing Errors</span>
        </span>
      );
    }

    // TODO: Determine what from the file can be used for the Operator
    const validContents = this.validateUpload(updatedOperator);

    if (validContents) {
      const mergedOperator = _.merge({}, operator, updatedOperator);

      this.compareSections(operator, mergedOperator);
      onUpdate(mergedOperator);

      upload.status = (
        <span className="oh-operator-editor-upload__uploads__status">
          <Icon type="fa" name="check-circle" />
          <span className="oh-operator-editor-upload__uploads__status__message">Supported File</span>
        </span>
      );
    } else {
      upload.status = (
        <span className="oh-operator-editor-upload__uploads__status">
          <Icon type="fa" name="times-circle" />
          <span className="oh-operator-editor-upload__uploads__status__message">Contains Errors</span>
        </span>
      );
    }
  };

  compareSections = (operator, merged) => {
    const { markSectionForReview } = this.props;

    Object.keys(sectionsFields).forEach(sectionName => {
      const fields = sectionsFields[sectionName];
      let same = true;

      // check if operator fields are same as before upload
      if (typeof fields === 'string') {
        same = _.isEqual(_.get(operator, fields), _.get(merged, fields));
      } else {
        same = fields.every(path => _.isEqual(_.get(operator, path), _.get(merged, path)));
      }

      if (!same) {
        // if not mark section as needing review
        markSectionForReview(sectionName);
      }
    });
  };

  doUploadUrl = (contents, url) => {
    const { uploads } = this.state;

    const upload = {
      uploadFile: url,
      contents,
      uploadError: false
    };
    this.applyUpload(upload);

    this.setState({ uploads: [...uploads, upload], uploadUrlShown: false });
  };

  doUploadFile = files => {
    const { uploads } = this.state;
    const fileToUpload = files && files[0];

    if (!fileToUpload) {
      return;
    }

    const validFileType = new RegExp(`(${validFileTypes.join('|').replace(/\./g, '\\.')})$`, 'i').test(
      fileToUpload.name
    );
    if (!validFileType) {
      this.props.showErrorModal('Unable to upload file: Only yaml files are supported');
      return;
    }

    const reader = new FileReader();

    const upload = {
      uploadFile: fileToUpload.name,
      uploadError: false
    };

    reader.onload = () => {
      upload.contents = reader.result;
      this.applyUpload(upload);
      this.setState({ uploads: [...uploads, upload] });
    };

    reader.onerror = () => {
      upload.uploadError = true;
      upload.status = (
        <span className="oh-operator-editor-upload__uploads__status">
          <Icon type="pf" name="error-circle" />
          <span className="oh-operator-editor-upload__uploads__status__message">{reader.error.message}</span>
        </span>
      );
      this.setState({ uploads: [...uploads, upload] });

      reader.abort();
    };

    reader.readAsText(fileToUpload);
  };

  handleDragDropEvent = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver });
  };

  removeAllUploads = e => {
    e.preventDefault();
    this.setState({ uploads: [] });
  };

  removeUpload = (e, upload) => {
    const { uploads } = this.state;

    e.preventDefault();
    this.setState({ uploads: _.filter(uploads, nextUpload => nextUpload !== upload) });
  };

  showUploadUrl = e => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  renderDropArea() {
    const { advancedUpload, dragOver } = this.state;

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    return (
      <div className="oh-file-upload__form">
        <div
          className={uploadFileClasses}
          onDrag={e => this.handleDragDropEvent(e)}
          onDragStart={e => this.handleDragDropEvent(e)}
          onDragEnd={e => this.handleDragDropEvent(e)}
          onDragOver={e => this.handleDragDropEvent(e)}
          onDragEnter={e => this.handleDragDropEvent(e)}
          onDragLeave={e => this.handleDragDropEvent(e)}
          onDrop={e => {
            this.handleDragDropEvent(e);
            this.doUploadFile(e.dataTransfer.files);
          }}
        >
          <form
            className="oh-drag-drop-box__upload-file-box"
            method="post"
            action=""
            encType="multipart/form-data"
            onDrag={e => this.handleDragDropEvent(e)}
            onDragStart={e => this.handleDragDropEvent(e)}
            onDragEnd={e => this.handleDragDropEvent(e)}
            onDragOver={e => this.handleDragDropEvent(e, true)}
            onDragEnter={e => this.handleDragDropEvent(e, true)}
            onDragLeave={e => this.handleDragDropEvent(e)}
            onDrop={e => {
              this.handleDragDropEvent(e);
              this.doUploadFile(e.dataTransfer.files);
            }}
          >
            <input
              className="oh-drag-drop-box__upload-file-box__file"
              type="file"
              name="fileModalUploadFile"
              id="fileModalUploadFile"
              onChange={e => this.doUploadFile(e.target.files)}
            />
            {advancedUpload ? 'Drag your file here,' : ''}
            <label htmlFor="fileModalUploadFile">
              <a className="oh-drag-drop-box__upload-file-box__link">{advancedUpload ? 'browse' : 'Browse'}</a>
            </label>
            to upload, or
            <label>
              <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={this.showUploadUrl}>
                upload
              </a>
            </label>
            from a URL.
          </form>
        </div>
      </div>
    );
  }

  renderUpload(upload) {
    return (
      <Grid.Row className="oh-operator-editor-upload__uploads__row" key={upload.uploadFile}>
        <Grid.Col xs={6}>{upload.uploadFile}</Grid.Col>
        <Grid.Col xs={3}>{upload.status}</Grid.Col>
        <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__actions-col">
          <a href="#" onClick={e => this.removeUpload(e, upload)}>
            <Icon type="fa" name="trash" />
            <span className="sr-only">Remove</span>
          </a>
        </Grid.Col>
      </Grid.Row>
    );
  }

  renderUploads() {
    const { uploads } = this.state;

    if (_.isEmpty(uploads)) {
      return null;
    }

    return (
      <Grid fluid className="oh-operator-editor-upload__uploads">
        <Grid.Row className="oh-operator-editor-upload__uploads__row">
          <Grid.Col xs={6}>File Name</Grid.Col>
          <Grid.Col xs={3}>Status</Grid.Col>
          <Grid.Col xs={3} className="oh-operator-editor-upload__uploads__actions-col">
            <a href="#" onClick={e => this.removeAllUploads(e)}>
              <Icon type="fa" name="trash" />
              <span>Remove All</span>
            </a>
          </Grid.Col>
        </Grid.Row>
        {_.map(uploads, upload => this.renderUpload(upload))}
      </Grid>
    );
  }
  render() {
    const { uploadUrlShown } = this.state;

    return (
      <React.Fragment>
        {this.renderDropArea()}
        {this.renderUploads()}
        <UploadUrlModal show={uploadUrlShown} onUpload={this.doUploadUrl} onClose={this.hideUploadUrl} />
      </React.Fragment>
    );
  }
}

ManifestUploader.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func,
  markSectionForReview: PropTypes.func
};

ManifestUploader.defaultProps = {
  showErrorModal: helpers.noop,
  markSectionForReview: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  showErrorModal: error =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Error Uploading File',
      icon: <Icon type="pf" name="error-circle-o" />,
      heading: error,
      confirmButtonText: 'OK'
    }),
  markSectionForReview: sectionName =>
    dispatch({
      type: reduxConstants.SET_EDITOR_SECTION_STATUS,
      section: sectionName,
      status: EDITOR_STATUS.pending
    })
});

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManifestUploader);