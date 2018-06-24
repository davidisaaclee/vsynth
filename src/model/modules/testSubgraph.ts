import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';

export const testSubgraph: VideoModule<SubgraphModule> = {
	inlets: {
		keys: ['a'],
		associatedParameters: {}
	},

	parameters: {
		keys: ['p', 'rotation'],
		defaultValues: {
			p: 0,
			rotation: 0,
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			'a': {
				nodeKey: 'osc',
				inletKey: 'waveSize',
			}
		},

		parametersToSubParameters: params => ({
			'osc': {
				'green': params['p'],
			},

			'k': {
				'value': params['rotation'],
			}
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'oscillator',
				'osc');
			result = Graph.insertNode(
				result,
				'constant',
				'k');
			result = Graph.insertEdge(
				result,
				{
					src: 'osc',
					dst: 'k',
					metadata: {
						inlet: 'rotation',
					}
				},
				'k -> osc.rot');
			return {
				graph: result,
				outputNodeKey: 'osc'
			};
		}
	},
};

