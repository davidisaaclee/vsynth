import { mapValues } from 'lodash';
import { ActionType } from 'typesafe-actions';
import { VideoNode } from '../../model/SimpleVideoGraph';
import { modules, videoModuleSpecFromModule } from '../../model/Kit';
import * as Constants from './constants';
import * as actions from './actions';

export interface State {
	nodes: { [key: string]: VideoNode };
	outputNodeKey: string | null;

	nodeOrder: string[];
	inletConnections: { [nodeKey: string]: { [inletKey: string]: number } };
	outletConnections: { [nodeKey: string]: number };
	busCount: number;
};

const initialState: State = {
	nodes: {
		'output': videoModuleSpecFromModule(modules.identity),
		'default-constant': videoModuleSpecFromModule(modules.constant),
	},
	outputNodeKey: 'output',

	nodeOrder: ['output', 'default-constant'],
	inletConnections: {},
	outletConnections: {
		'default-constant': -1,
		'output': -2,
	},
	busCount: 5,
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case Constants.SET_MASTER_OUTPUT:
			return {
				...state,
				outputNodeKey: action.payload,
			};

		case Constants.SET_INLET_CONNECTION:
			return (({ nodeKey, inletKey, busIndex }) => ({
				...state,
				inletConnections: {
					...state.inletConnections,
					[nodeKey]: {
						...(state.inletConnections[nodeKey] == null
							? {}
							: state.inletConnections[nodeKey]),
						[inletKey]: busIndex
					}
				}
			}))(action.payload);

		case Constants.SET_OUTLET_CONNECTION:
			return (({ nodeKey, busIndex }) => ({
				...state,
				outletConnections: {
					...state.outletConnections,
					[nodeKey]: busIndex
				}
			}))(action.payload);

		case Constants.INSERT_NODE:
			return {
				...state,
				nodes: {
					...state.nodes,
					[action.payload.id]: action.payload.node
				},
				nodeOrder: [
					...state.nodeOrder,
					action.payload.id
				]
			};

		case Constants.SET_PARAMETER:
			return (({ nodeKey, parameterKey, value }) => {
				const node = {
					...state.nodes[nodeKey],
					parameters: {
						...state.nodes[nodeKey].parameters,
						[parameterKey]: value
					}
				};

				// Write new uniforms from parameter change to node.
				const videoModule = modules[node.type];
				if (videoModule.parameters != null) {
					node.uniforms = {
						...node.uniforms,
						...videoModule.parameters.toUniforms(node.parameters)
					};
				}

				return {
					...state,
					nodes: {
						...state.nodes,
						[nodeKey]: node
					}
				};
			})(action.payload);

		case Constants.ADD_BUS:
			return {
				...state,
				busCount: state.busCount + 1
			};

		case Constants.UPDATE_NODES:
			return ((frameIndex: number) => ({
				...state,
				nodes: mapValues(
					state.nodes,
					node => {
						const videoModule = modules[node.type];
						if (videoModule.update == null) {
							return node;
						}

						return {
							...node,
							state: videoModule.update(
								frameIndex,
								node.state,
								node)
						};
					})
			}))(action.payload.frameIndex);

		default:
			return state;
	}
};


