import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../../common/helpers';
import OperatorEditorSubPage from '../OperatorEditorSubPage';
import { getUpdatedFormErrors } from '../bundlePageUtils';
import {
  setSectionStatusAction,
  storeEditorFormErrorsAction,
  storeEditorOperatorAction
} from '../../../redux/actions/editorActions';
import { getDefaultRequiredCRD } from '../../../utils/operatorUtils';
import { NEW_CRD_NAME, sectionsFields, EDITOR_STATUS } from '../../../utils/constants';
import OperatorInputUncontrolled from '../../../components/editor/forms/OperatorInputUncontrolled';
import OperatorTextAreaUncontrolled from '../../../components/editor/forms/OperatorTextAreaUncontrolled';
import { operatorFieldDescriptions } from '../../../utils/operatorDescriptors';

const crdsField = sectionsFields['required-crds'];
const crdDescriptions = _.get(operatorFieldDescriptions, crdsField);

class OperatorRequiredCRDEditPage extends React.Component {
  touchedFields = {};
  crdIndex;
  isNewCRD = false;

  originalName;

  constructor(props) {
    super(props);

    this.crdIndex = parseInt(_.get(props.match, 'params.index'), 10);
  }

  componentDidMount() {
    const { operator, formErrors, storeEditorFormErrors, storeEditorOperator, isNew } = this.props;
    const clonedOperator = _.cloneDeep(operator);
    const operatorCRDs = _.get(clonedOperator, crdsField, []);

    this.name = helpers.transformPathedName(_.get(this.props.match, 'params.crd', ''));
    let crd = operatorCRDs[this.crdIndex];

    if (isNew) {
      crd = getDefaultRequiredCRD();
      crd.name = NEW_CRD_NAME;

      operatorCRDs.push(crd);
    }

    this.crdIndex = operatorCRDs.indexOf(crd);

    const errors = getUpdatedFormErrors(clonedOperator, formErrors, crdsField);
    this.updateCrdErrors(errors);
    storeEditorFormErrors(errors);

    // update operator with crds if they were not existing
    _.set(clonedOperator, crdsField, operatorCRDs);
    // update operator as there might be added / changed crd
    storeEditorOperator(clonedOperator);

    if (crd.name === '' || crd.name === NEW_CRD_NAME) {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  componentDidUpdate(prevProps) {
    const { formErrors } = this.props;

    if (!_.isEqual(formErrors, prevProps.formErrors)) {
      this.updateCrdErrors(formErrors);
    }
  }

  updateCrdErrors = formErrors => {
    const { setSectionStatus } = this.props;

    const crdErrors = _.find(_.get(formErrors, crdsField), { index: this.crdIndex });

    if (crdErrors) {
      setSectionStatus('required-crds', EDITOR_STATUS.errors);
    } else {
      setSectionStatus('required-crds', EDITOR_STATUS.pending);
    }
  };

  validateField = (field, value) => {
    const { operator, formErrors, storeEditorOperator, storeEditorFormErrors } = this.props;
    const updatedOperator = _.cloneDeep(operator);

    this.touchedFields[field] = true;

    // update the operator's version of this CRD
    const existingCRDs = _.get(updatedOperator, crdsField);
    const crd = existingCRDs[this.crdIndex];

    // update crd field value
    _.set(crd, field, value);

    _.set(updatedOperator, crdsField, [
      ...existingCRDs.slice(0, this.crdIndex),
      crd,
      ...existingCRDs.slice(this.crdIndex + 1)
    ]);

    const errors = getUpdatedFormErrors(updatedOperator, formErrors, crdsField);
    storeEditorFormErrors(errors);

    storeEditorOperator(updatedOperator);

    if (field === 'name' && value !== this.originalName) {
      this.updatePagePathOnNameChange(value);
    }
  };

  updatePagePathOnNameChange = name => {
    const { location, history, isNew } = this.props;

    if (!isNew) {
      history.push(location.pathname.replace(this.originalName, name));
      this.originalName = name;
    }
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderCRDInput = (title, field, fieldType, inputRefCallback) => {
    const { operator, formErrors } = this.props;
    const crdErrors = (_.find(_.get(formErrors, crdsField), { index: this.crdIndex }) || [{ errors: {} }]).errors;

    // update the operator's version of this CRD
    const existingCRDs = _.get(operator, crdsField);
    const crd = existingCRDs[this.crdIndex];

    const errors = (this.isNewCRD ? this.touchedFields[field] && crdErrors : crdErrors) || {};

    if (fieldType === 'text-area') {
      return (
        <OperatorTextAreaUncontrolled
          field={field}
          title={title}
          defaultValue={_.get(crd, field, '')}
          formErrors={errors}
          commitField={this.validateField}
          refCallback={inputRefCallback}
          descriptions={crdDescriptions}
        />
      );
    }
    return (
      <OperatorInputUncontrolled
        field={field}
        title={title}
        defaultValue={_.get(crd, field, '')}
        inputType="text"
        formErrors={errors}
        commitField={this.validateField}
        refCallback={inputRefCallback}
        descriptions={crdDescriptions}
      />
    );
  };

  render() {
    const { history } = this.props;

    return (
      <OperatorEditorSubPage
        title="Edit Required CRD"
        tertiary
        lastPage="required-crds"
        lastPageTitle="Required CRDs"
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDInput('Name', 'name', 'text', this.setNameInputRef)}
          {this.renderCRDInput('Display Name', 'displayName', 'text')}
          {this.renderCRDInput('Description', 'description', 'text-area')}
          {this.renderCRDInput('Kind', 'kind', 'text')}
          {this.renderCRDInput('Version', 'version', 'text')}
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorRequiredCRDEditPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  setSectionStatus: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object,
  isNew: PropTypes.bool
};

OperatorRequiredCRDEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  location: {},
  isNew: false,
  storeEditorOperator: helpers.noop,
  storeEditorFormErrors: helpers.noop,
  setSectionStatus: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction,
      setSectionStatus: setSectionStatusAction
    },
    dispatch
  )
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorRequiredCRDEditPage);
