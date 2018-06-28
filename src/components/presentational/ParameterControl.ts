import * as React from 'react';
import styled from '../../styled-components';
import { RelativeDragCapture, RelativeDragData } from '@davidisaaclee/react-drag-capture';

const e = React.createElement;

const ControlContainer = styled(RelativeDragCapture)`
	display: inline-block;

	width: 50px;
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

		return e('fieldset',
			{
				style: {
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
				}
			},
			e('label',
				{},
				name),
			e('div',
				{},
				e(ControlContainer,
					{
						dragDidBegin: (
							pointerID: string,
							{ relativePosition }: RelativeDragData
						) => {
							this.setState({
								cursorState: { relativePosition },
							});
						},
						dragDidMove: (
							pointerID: string,
							{ relativePosition }: RelativeDragData
						) => {
							const cursorState = this.state.cursorState;
							if (cursorState == null) {
								return;
							}

							const clamped = Math.min(1, Math.max(0, value + relativePosition.x - cursorState.relativePosition.x));
							onChange(clamped);

							this.setState({
								cursorState: { relativePosition }
							});
						},
						dragDidEnd: (
							pointerID: string,
						) => {
							this.setState({
								cursorState: null
							});
						},
					},
					e(Fill,
						{
							value
						}))));
	}

}

export default ParameterControl;


