import { ActionType } from 'typesafe-actions';
import { SimpleVideoGraph } from '../../model/SimpleVideoGraph';
// import { BUILD_GRAPH } from './constants';
import * as actions from './actions';
// import buildGraph from '../../oscillator-mod';

export interface State {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
};

const initialState: State = {
	graph: {
		nodes: {
			'constant': {
				type: 'constant',
				uniforms: {
					value: {
						type: '3f',
						data: [0, 0, 0],
					}
				},
			},
			'oscillator': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 20,
					}
				},
			},
			'lfo': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 11,
					}
				},
			},
		},
		edges: {
			'constant -> oscillator.rotation': {
				src: 'oscillator',
				dst: 'constant',
				metadata: {
					inlet: 'rotation'
				}
			},
			/*
			'constant -> lfo.rotation': {
				src: 'lfo',
				dst: 'constant',
				metadata: {
					uniformIdentifier: 'rotationTheta'
				}
			},
			'lfo -> osc.rotation': {
				src: 'oscillator',
				dst: 'lfo',
				metadata: {
					uniformIdentifier: 'rotationTheta'
				}
			}
			*/
		}
	},
	outputNodeKey: 'oscillator'
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
			/*
		case BUILD_GRAPH:
			return {
				...state,
				graph: buildGraph(action.payload, 20, 0.2),
				outputNodeKey: 'oscillator',
			};
			*/

		default:
			return state;
	}
};


