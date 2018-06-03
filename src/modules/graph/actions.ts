import { action } from 'typesafe-actions';
import { INCREMENT } from './constants';

export const increment =
	(delta: number) => action(INCREMENT, delta);

