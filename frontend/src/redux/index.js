import { combineReducers } from 'redux';
import { operatorsReducer } from './operatorsReducer';
import { viewReducer } from './viewReducer';
import { editorReducer } from './editorReducer';
import { previewReducer } from './previewReducer';
import { confirmationModalReducer } from './confirmationModalReducer';

const reduxConstants = {
  GET_OPERATORS: 'GET_OPERATORS',
  GET_OPERATOR: 'GET_OPERATOR',
  GET_OLM_VERSION: 'GET_OLM_RELEASE_VERSION',
  SET_ACTIVE_FILTERS: 'SET_ACTIVE_FILTERS',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  SET_KEYWORD_SEARCH: 'SET_KEYWORD_SEARCH',
  SET_SORT_TYPE: 'SET_SORT_TYPE',
  SET_VIEW_TYPE: 'SET_VIEW_TYPE',
  SET_URL_SEARCH_STRING: 'SET_URL_SEARCH_STRING',
  SET_EDITOR_OPERATOR: 'SET_EDITOR_OPERATOR',
  SET_EDITOR_FORM_ERRORS: 'SET_EDITOR_FORM_ERRORS',
  SET_EDITOR_SECTION_STATUS: 'SET_EDITOR_SECTION_STATUS',
  SET_EDITOR_ALL_SECTIONS_STATUS: 'SET_EDITOR_ALL_SECTIONS_STATUS',
  RESET_EDITOR_OPERATOR: 'RESET_EDITOR_OPERATOR',
  SET_EDITOR_PACKAGE: 'SET_EDITOR_PACKAGE',
  SET_EDITOR_UPLOADS: 'SET_EDITOR_UPLOADS',
  SET_PREVIEW_YAML: 'SET_PREVIEW_YAML',
  SET_PREVIEW_CONTENT_HEIGHT: 'SET_PREVIEW_CONTENT_HEIGHT',
  CONFIRMATION_MODAL_SHOW: 'CONFIRMATION_MODAL_SHOW',
  CONFIRMATION_MODAL_HIDE: 'CONFIRMATION_MODAL_HIDE'
};

const reducers = {
  operatorsState: operatorsReducer,
  viewState: viewReducer,
  editorState: editorReducer,
  previewState: previewReducer,
  confirmationModal: confirmationModalReducer
};

const reduxReducers = combineReducers(reducers);

export { reduxConstants, reduxReducers, reducers };
