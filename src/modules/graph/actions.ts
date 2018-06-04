import { action } from 'typesafe-actions';
import { BUILD_GRAPH } from './constants';

export const buildGraph =
	(gl: WebGLRenderingContext) => action(BUILD_GRAPH, gl);

