import { entries } from 'lodash';
import { createSelector } from 'reselect';
import { nodeForKey } from '@davidisaaclee/graph';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as sharedSelectors from '../../../modules/sharedSelectors';

export const parametersForNodeKey = createSelector(
	[
		sharedSelectors.graph
	],
	(graph: SimpleVideoGraph) => (nodeKey: string) => {
		const node = nodeForKey(graph, nodeKey)!;
		return entries(node.parameters)
		// TODO: not certain why this type annotation is necessary
			.map(([identifier, value]: [string, number]) => ({
				key: identifier,
				name: identifier,
				value
			}));
	});

