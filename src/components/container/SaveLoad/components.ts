import * as React from 'react';
import styled from '../../../styled-components';

const e = React.createElement;

export const Container = styled.div`
`;

interface ToolbarProps {
	onClickLoad: () => any;
}

export const Toolbar: React.StatelessComponent<ToolbarProps> = ({ onClickLoad }) => (
	e('div',
		{},
		e('button',
			{ onClick: onClickLoad },
			'Load')));

interface FileTextProps {
	text: string;
}
export const FileText = styled.textarea.attrs<FileTextProps>({
	value: (props: FileTextProps) => props.text,
})`
`;

