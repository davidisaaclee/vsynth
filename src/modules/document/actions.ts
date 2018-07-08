import { action } from 'typesafe-actions';
import * as Constants from './constants';
import { VideoNode } from '../../model/SimpleVideoGraph';
import { State as Document } from './reducer';

export const setMasterOutput = (nodeKey: string) =>
	action(Constants.SET_MASTER_OUTPUT, nodeKey);

export const setInletConnection = (nodeKey: string, inletKey: string, busIndex: number) =>
	action(Constants.SET_INLET_CONNECTION, { nodeKey, inletKey, busIndex });

export const setOutletConnection = (nodeKey: string, busIndex: number) =>
	action(Constants.SET_OUTLET_CONNECTION, { nodeKey, busIndex });

export const insertNode = (node: VideoNode, id: string) =>
	action(Constants.INSERT_NODE, { node, id });

export const setParameter = (nodeKey: string, parameterKey: string, value: number) =>
	action(Constants.SET_PARAMETER, { nodeKey, parameterKey, value });

export const addBus = () =>
	action(Constants.ADD_BUS);

export const removeNode = (nodeKey: string) =>
	action(Constants.REMOVE_NODE, nodeKey);

export const resetAll = () =>
	action(Constants.RESET_ALL);

export const loadDocument = (doc: Document) =>
	action(Constants.LOAD_DOCUMENT, doc);

