import { action } from 'typesafe-actions';
import { SET_MASTER_OUTPUT, CONNECT_NODES, DISCONNECT_NODES } from './constants';

export const setMasterOutput =
	(nodeKey: string) => action(SET_MASTER_OUTPUT, nodeKey);

export const connectNodes =
	(fromNodeKey: string, toNodeKey: string, inletKey: string) => action(CONNECT_NODES, { fromNodeKey, toNodeKey, inletKey });

export const disconnectNodes =
	(fromNodeKey: string, toNodeKey: string, inletKey: string) => action(DISCONNECT_NODES, { fromNodeKey, toNodeKey, inletKey });

