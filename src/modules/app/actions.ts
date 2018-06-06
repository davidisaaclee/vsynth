import { action } from 'typesafe-actions';
import { SET_MODAL } from './constants';
import { Modal } from './modals';

export const setModal =
	(modal: Modal | null) => action(SET_MODAL, modal);

