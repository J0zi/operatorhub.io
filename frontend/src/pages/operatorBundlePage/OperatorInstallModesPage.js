import * as React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { getFieldValueError } from '../../utils/operatorUtils';
import InstallModeEditor from '../../components/editor/InstallModeEditor';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';
import { sectionsFields } from '../../utils/constants';

const installModesFields = sectionsFields['install-modes'];

const OperatorInstallModesPage = ({ operator, formErrors, storeEditorOperator, storeEditorFormErrors, history }) => {
  const validateField = field => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  const updateInstallModes = installModes => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, installModesFields, installModes);
    storeEditorOperator(updatedOperator);
    validateField('spec.install.spec.deployments');
  };

  return (
    <OperatorEditorSubPage
      title="Install Modes"
      field={installModesFields}
      secondary
      history={history}
      section="install-modes"
    >
      <InstallModeEditor operator={operator} onUpdate={updateInstallModes} />
    </OperatorEditorSubPage>
  );
};

OperatorInstallModesPage.propTypes = {
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorInstallModesPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperator: storeEditorOperatorAction,
      storeEditorFormErrors: storeEditorFormErrorsAction
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
)(OperatorInstallModesPage);
