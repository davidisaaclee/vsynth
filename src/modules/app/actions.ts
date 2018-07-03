import { action } from 'typesafe-actions';
import * as Constants from './constants';
import { Modal } from './modals';

export const setModal =
	(modal: Modal | null) => action(Constants.SET_MODAL, modal);

export const previewParameter = (nodeKey: string, parameterKey: string, value: number) =>
	action(Constants.PREVIEW_PARAMETER, { nodeKey, parameterKey, value });

export const clearPreviewedParameter = () =>
	action(Constants.CLEAR_PREVIEWED_PARAMETER);

