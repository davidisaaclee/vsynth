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
	onInputValue: (value: number) => any;
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
			onInputValue,
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
					tabIndex: 0,

					onKeyDown: (evt: React.KeyboardEvent<HTMLSpanElement>) => {
						type Command = "increment" | "decrement";

						function commandFromKeyCode(keyCode: number): Command | null {
							switch (keyCode) {
								case 37:
									return 'decrement';

								case 38:
									return 'increment';

								case 39:
									return 'increment';

								case 40:
									return 'decrement';

								default:
									return null;
							}
						}

						const deltaMagnitude = 0.01;

						switch (commandFromKeyCode(evt.keyCode)) {
							case 'increment':
								onChangeValue(value + deltaMagnitude);
								return;

							case 'decrement':
								onChangeValue(value - deltaMagnitude);
								return;
						}
					},

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

						// 1 when in slider; increasing when outside of and moving away from slider
						const precisionFactor = (() => {
							if (relativePosition.y >= 0 && relativePosition.y <= 1) {
								return 1;
							} else if (relativePosition.y > 1) {
								return relativePosition.y;
							} else {
								return Math.abs(relativePosition.y) + 1;
							}
						})();

						const delta =
							(relativePosition.x - cursorState.relativePosition.x) / precisionFactor;
						onInputValue(clamp(value + delta, 0, 1));

						this.setState({
							cursorState: { relativePosition }
						});
					},

					onPointerUp: (evt: React.PointerEvent<HTMLSpanElement>) => {
						onChangeValue(value);
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


