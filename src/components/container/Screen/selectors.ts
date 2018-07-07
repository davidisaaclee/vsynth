import { createSelector } from 'reselect';
import * as sharedSelectors from '../../../modules/sharedSelectors';

export const graph = sharedSelectors.graph;
export const outputNodeKey = sharedSelectors.outputNodeKey;

// The document edit hash only changes on committed changes to the document.
// The screen needs to render on temporary changes as well.
// Augment the document edit hash with the temporary changes (from previewed parameter changes).
export const editHash = createSelector(
	[sharedSelectors.editHash, sharedSelectors.previewedParameterChanges],
	(documentEditHash, temporaryChanges) => `${documentEditHash}-${JSON.stringify(temporaryChanges)}`);

