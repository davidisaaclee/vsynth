import styled, { css } from '../../../styled-components';

export const Container = styled.div`
	display: flex;
	flex-flow: column nowrap;
	height: 100%;
`;

export const TextContainer = styled.div`
	display: flex;
	flex: 1;
	margin-bottom: 20px;

	position: relative;
`;

const sharedButtonStyles = css`
	border: 1px solid white;

	background-color: black;
	color: white;

	&:hover, &:active {
		background-color: #555;
	}
`;

export const CopyButton = styled.button`
	${sharedButtonStyles}
	position: absolute;
	padding: 10px;

	right: 1em;
	top: 1em;
`;

export const LoadButton = styled.button`
	${sharedButtonStyles}
	padding: 20px;
	font-size: 16pt;
`;

interface FileTextProps {
	text: string;
}
export const FileText = styled.textarea.attrs<FileTextProps>({
	value: (props: FileTextProps) => props.text,
})`
	flex: 1;
	padding: 1em;

	font-family: monospace;
	background-color: #333;
	color: #777;
	border: none;
	resize: none;

	&:focus {
		color: #fff;
	}
`;

