import { clamp } from 'lodash';
import * as React from 'react';
import styled from '../../styled-components';

const e = React.createElement;

const FieldSet = styled.div`
	border: none;
	background-color: rgba(255, 255, 255, 0.5);
	padding: 0;

	display: flex;
	flex-flow: column-reverse nowrap;
	align-items: center;

	padding: 10px;
`;

const ParameterNameLabel = styled.label`
`;

const ControlContainer = styled.span.attrs({
	// HACK: Providing custom attributes to DOM elements is supported in React 16,
	// but the typings don't reflect this.
	// To provide a custom attribute, hide it from the type checker.
	...{ 'touch-action': 'none' } as {},
})`
	display: inline-block;

	width: 80%;
	height: 50px;

	background-color: black;

	&:hover {
		background-color: #333;
	}
`;

interface FillProps {
	value: number;
}
const Fill = styled.span.attrs<FillProps>({
	style: ({ value }: FillProps) => ({
		width: `${value * 100}%`
	})
})`
	display: block;
	height: 100%;
	background-color: white;
`;

interface Props {
	name: string;
	value: number;

	onChange: (value: number) => any;
}

interface State {
	cursorState: { relativePosition: { x: number, y: number } } | null;
}


class ParameterControl extends React.Component<Props, State> {

	public state = {
		cursorState: null as { relativePosition: { x: number, y: number } } | null,
	}

	public render() {
		const {
			name, value,
			onChange,
		} = this.props;

		return e(FieldSet,
			{},
			e(ParameterNameLabel,
				{},
				name),
			e(ControlContainer,
				{
					onPointerDown: (evt: React.PointerEvent<HTMLSpanElement>) => {
						evt.currentTarget.setPointerCapture(evt.pointerId);

						const relativePosition =
							relativePositionFromMouseEvent(evt);
						this.setState({
							cursorState: { relativePosition }
						});
					},

					onPointerMove: (evt: React.PointerEvent<HTMLSpanElement>) => {
						const cursorState =
							this.state.cursorState;
						if (cursorState == null) {
							return;
						}

						const relativePosition =
							relativePositionFromMouseEvent(evt);

						const delta =
							relativePosition.x - cursorState.relativePosition.x;
						onChange(clamp(value + delta, 0, 1));

						this.setState({
							cursorState: { relativePosition }
						});
					},

					onPointerUp: (evt: React.PointerEvent<HTMLSpanElement>) => {
						this.setState({ cursorState: null });
					}
				},
				e(Fill,
					{
						value
					})));
	}

}


function relativePositionFromMouseEvent<E extends HTMLElement>(evt: React.MouseEvent<E>): { x: number, y: number } {
	return clientToRelative(
		clientPositionFromMouseEvent(evt),
		evt.currentTarget);
}

function clientPositionFromMouseEvent<E extends HTMLElement>(evt: React.MouseEvent<E>): { x: number, y: number } {
	return {
		x: evt.clientX,
		y: evt.clientY,
	};
}

function clientToRelative(clientPosition: { x: number, y: number }, element: HTMLElement): { x: number, y: number } {
	const boundingBox = element.getBoundingClientRect();
	return {
		x: (clientPosition.x - boundingBox.left) / boundingBox.width,
		y: (clientPosition.y - boundingBox.top) / boundingBox.height
	};
}

export default ParameterControl;


