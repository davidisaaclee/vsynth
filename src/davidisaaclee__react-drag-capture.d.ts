declare module '@davidisaaclee/react-drag-capture' {
	import * as React from 'react';

	export interface Point {
		x: number;
		y: number;
	}

	export interface DragData {
		clientPosition: Point;
	}

	export interface RelativeDragData extends DragData {
		relativePosition: Point;
	}

	export interface RelativeDragCaptureProps {
		dragDidBegin?: (pointerID: string, data: RelativeDragData) => any;
		dragDidMove?: (pointerID: string, data: RelativeDragData) => any;
		dragDidEnd?: (pointerID: string) => any;
	}

	export class RelativeDragCapture extends React.Component<RelativeDragCaptureProps, any> {
	}
}

	/*
import * as React from 'react';

export interface Point {
	x: number;
	y: number;
}

export interface RelativeDragCaptureProps {
	dragDidBegin: (pointerID: string, data: { clientPosition: Point }) => any;
	dragDidMove: (pointerID: string, data: { clientPosition: Point }) => any;
	dragDidEnd: (pointerID: string) => any;
}

export class RelativeDragCapture extends React.Component<RelativeDragCaptureProps, any> {
}

	*/
