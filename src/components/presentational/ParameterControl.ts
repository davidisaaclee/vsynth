import { clamp } from 'lodash';
import * as React from 'react';
import styled from '../../styled-components';
import { deviceQueries } from '../../utility/mediaQueries';

const e = React.createElement;

const FieldSet = styled.div`
	position: relative;
	border: none;
	text-align: center;
`;

const ParameterNameLabel = styled.label`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);

	pointer-events: none;
	color: rgba(50, 50, 50, 1);
	text-shadow: 1px 1px 0px rgba(200, 200, 200, 1);

	${deviceQueries.mobile`
		font-size: 9pt;
	`}
`;

const ControlContainer = styled.span.attrs({
	// HACK: Providing custom attributes to DOM elements is supported in React 16,
	// but the typings don't reflect this.
	// To provide a custom attribute, hide it from the type checker.
	...{ 'touch-action': 'none' } as {},
})`
	display: inline-block;

	width: 100%;
	height: 100%;

	background-color: #1a1a1a;

	&:hover {
		background-color: #000;

		& > .parameter-control-fill {
			background-color: #fff;
		}
	}
`;

interface FillProps {
	value: number;
}
const Fill = styled.span.attrs<FillProps>({
	className: 'parameter-control-fill',
	style: ({ value }: FillProps) => ({
		width: `${value * 100}%`
	})
})`
	display: block;
	height: 100%;
	background-color: #ededed;
`;

interface OwnProps {
	name: string;
	value: number;

	onChangeValue: (value: number) => any;
}

type Props = OwnProps & React.HTMLAttributes<HTMLDivElement>;

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
			onChangeValue,
			...restProps
		} = this.props;

		return e(FieldSet,
			restProps,
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
						onChangeValue(clamp(value + delta, 0, 1));

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


