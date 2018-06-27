import * as React from 'react';

const e = React.createElement;

interface Props {
	name: string;
	value: number;

	onChange: (value: number) => any;
}

interface State {}


class ParameterControl extends React.Component<Props, State> {

	public render() {
		const {
			name, value, onChange,
		} = this.props;

		return e('fieldset',
			{
				style: {
					backgroundColor: 'rgba(255, 255, 255, 0.5)',
					width: 50,
					height: 50,
				}
			},
			e('label',
				{},
				name),
			e('input',
				{
					type: 'range',
					min: 0,
					max: 1,
					step: 'any',
					value,
					onChange: evt => (
						onChange(parseFloat(evt.currentTarget.value))
					),
					style: {
						width: '100%',
					}
				}));
	}

}

export default ParameterControl;


