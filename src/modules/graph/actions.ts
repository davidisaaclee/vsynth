import { action } from 'typesafe-actions';
import { SET_MASTER_OUTPUT } from './constants';

export const setMasterOutput =
	(nodeKey: string) => action(SET_MASTER_OUTPUT, nodeKey);

