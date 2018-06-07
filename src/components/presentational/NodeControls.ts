import * as React from 'react';

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
					{},
					e('label',
						{},
						name),
					e('input',
						{
							key,
							type: 'range',
							min: 0,
							max: 1,
							step: 'any',
							value,
							onInput: (evt: React.SyntheticEvent<HTMLInputElement>) => (
								onEdit(parameterIndex, parseFloat(evt.currentTarget.value), key)
							)
						}))
			));
	}
}

