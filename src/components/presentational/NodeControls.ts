import * as React from 'react';
import styled from '../../styled-components';
import { throttle } from 'lodash';
import ParameterControl from './ParameterControl';

const e = React.createElement;

const Container = styled.div`
	display: flex;
	flex-flow: row wrap;
`;

export interface Props {
	parameters: Array<{ key: string, name: string, value: number }>;
	onEdit: (index: number, value: number, key: string) => any;
}

export default class NodeControls extends React.Component<Props, object> {
	public render() {
		const { parameters, onEdit } = this.props;

		return e(Container,
			{},
			parameters.map(({ key, name, value }, parameterIndex) =>
				e(ParameterControl,
					{
						key,
						name,
						value,
						onChange: throttle((newValue: number) => (
							onEdit(parameterIndex, newValue, key)
						), 1000 / 60)
					})));
	}
}

