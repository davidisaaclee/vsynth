import { createSelector } from 'reselect';
import { encodeDocument } from '../../../model/Coding';
import * as sharedSelectors from '../../../modules/sharedSelectors';

export const currentDocumentFile = createSelector(
	sharedSelectors.document,
	doc => JSON.stringify(encodeDocument(doc), null, 2));

