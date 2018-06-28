import { css } from '../styled-components';

// https://zellwk.com/blog/media-query-units/
function pixelsToEm(px: number): number {
	// TODO: I don't think this will work if the
	// default font size has been changed.
	return px / 16;
}

export const minWidth =
	(px: number) => `(min-width: ${pixelsToEm(px)}em)`
export const maxWidth =
	(px: number) => `(max-width: ${pixelsToEm(px)}em)`
export const onlyScreen =
	'only screen';
export const orient =
	(o: 'portrait' | 'landscape') => `(orientation: ${o})`;
export const minPixelRatio =
	(ratio: number) => `(-webkit-min-device-pixel-ratio: ${ratio})`;

export const combinePredicates =
	(queries: string[]) => queries.join(' and ');

export function media(predicate: string) {
	return (strings: TemplateStringsArray, ...interpolations: string[]) => {
		return css`
			@media ${predicate} {
				${css(strings, interpolations)}
			}
		`;
	};
}

export const deviceQueries = {
	mobile: media(combinePredicates([onlyScreen, maxWidth(800)])),
};

