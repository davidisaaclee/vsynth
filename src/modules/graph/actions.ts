import { action } from 'typesafe-actions';
import * as Constants from './constants';
import { VideoModuleSpecification } from '../../model/SimpleVideoGraph';

export const setMasterOutput = (nodeKey: string) =>
	action(Constants.SET_MASTER_OUTPUT, nodeKey);

export const connectNodes = (fromNodeKey: string, toNodeKey: string, inletKey: string) =>
	action(Constants.CONNECT_NODES, { fromNodeKey, toNodeKey, inletKey });

export const disconnectNodes = (fromNodeKey: string, toNodeKey: string, inletKey: string) =>
	action(Constants.DISCONNECT_NODES, { fromNodeKey, toNodeKey, inletKey });

export const insertNode = (node: VideoModuleSpecification, id: string) =>
	action(Constants.INSERT_NODE, { node, id });

export const setParameter = (nodeKey: string, parameterKey: string, value: number) =>
	action(Constants.SET_PARAMETER, { nodeKey, parameterKey, value });

