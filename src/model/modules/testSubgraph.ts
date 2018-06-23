import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';

export const testSubgraph: VideoModule<SubgraphModule> = {
	inlets: {
		keys: ['a'],
		associatedParameters: {}
	},

	parameters: {
		keys: ['p'],
		defaultValues: { p: 0 }
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
				'green': params['p']
			}
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'oscillator',
				'osc');
			return {
				graph: result,
				outputNodeKey: 'osc'
			};
		}
	},
};

