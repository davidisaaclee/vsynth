import * as React from 'react';
import { throttle } from 'lodash';

const e = React.createElement;

export interface Props {
	parameters: Array<{ key: string, name: string, value: number }>;
	onEdit: (index: number, value: number, key: string) => any;
}

export default class NodeControls extends React.Component<Props, object> {
	public render() {
		const { parameters, onEdit } = this.props;

		return e('div',
			{},
			parameters.map(({ key, name, value }, parameterIndex) =>
				e('fieldset',
					{
						key,
						style: {
							backgroundColor: 'rgba(255, 255, 255, 0.5)'
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
							onChange: throttle((evt: React.SyntheticEvent<HTMLInputElement>) => (
								onEdit(parameterIndex, parseFloat(evt.currentTarget.value), key)
							), 1000 / 60),
							style: {
								width: '100%',
							}
						}))
			));
	}
}

