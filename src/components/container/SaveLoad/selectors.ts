import { createSelector } from 'reselect';
import * as sharedSelectors from '../../../modules/sharedSelectors';

export const currentDocumentFile = createSelector(
	sharedSelectors.document,
	doc => JSON.stringify(doc));

