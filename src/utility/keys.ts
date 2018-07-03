import * as React from 'react';

export function isSpaceKeyEvent<E extends HTMLElement>(keyEvent: React.KeyboardEvent<E>): boolean {
	return keyEvent.keyCode === 32;
}

export function isEnterKeyEvent<E extends HTMLElement>(keyEvent: React.KeyboardEvent<E>): boolean {
	return keyEvent.keyCode === 13;
}

