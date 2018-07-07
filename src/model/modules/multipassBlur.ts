import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as CrossBlur from './crossBlur';

export const parameterKeys = {
	input: 'input',
};

export const inletKeys = {
	input: 'input',
};

const N_PASSES = 10;
export const nodeKeys = {
	nth: (n: number) => `pass-${n}`,
};

export const multipassBlur: VideoModule<SubgraphModule> = {
	description: 'Applies a 10-pass Gaussian blur to its input. (Slow!)',

	parameters: {
		keys: [
			parameterKeys.input,
		],
		defaultValues: {
			[parameterKeys.input]: 1,
		}
	},

	inlets: {
		keys: [inletKeys.input],

		associatedParameters: {
			[inletKeys.input]: parameterKeys.input,
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			[inletKeys.input]: [{
				nodeKey: nodeKeys.nth(0),
				inletKey: CrossBlur.inletKeys.input,
			}],
		},

		parametersToSubParameters: params => {
			const result = {};
			for (let i = 0; i < N_PASSES; i++) {
				result[nodeKeys.nth(i)] = {
					[CrossBlur.parameterKeys.rotation]: i / N_PASSES,
					...(i === 0
						? { [CrossBlur.parameterKeys.input]: params[parameterKeys.input] }
						: {})
				};
			}
			return result;
		},

		buildSubgraph: () => {
			let result = Graph.empty();
			for (let i = 0; i < N_PASSES; i++) {
				result = Graph.insertNode(
					result,
					'crossBlur',
					nodeKeys.nth(i));
			}
			for (let i = 1; i < N_PASSES; i++) {
				result = Graph.insertEdge(
					result,
					{
						dst: nodeKeys.nth(i - 1),
						src: nodeKeys.nth(i),
						metadata: {
							inlet: CrossBlur.inletKeys.input,
						}
					},
					`${nodeKeys.nth(i-1)} -> ${nodeKeys.nth(i)}.input`);
			}


			return {
				graph: result,
				outputNodeKey: nodeKeys.nth(N_PASSES - 1)
			};
		}
	}

};

