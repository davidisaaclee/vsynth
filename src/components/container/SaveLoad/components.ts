import * as React from 'react';
import styled, { css } from '../../../styled-components';
import { Example, defaultExamples } from './examples';

const e = React.createElement;

export const Container = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	height: 100%;
`;

export const TextContainer = styled.div`
	display: flex;
	flex: 1;
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
	z-index: 1;
`;

export const SaveButton = styled.button`
	${sharedButtonStyles}
	padding: 20px;
	margin-top: 20px;

	font-size: 16pt;
`;

const LoadButtonLabel = styled.label`
	${sharedButtonStyles}
	padding: 20px;
	margin-top: 20px;

	text-align: center;
	font-size: 16pt;
`;

interface LoadButtonProps {
	onLoadFile: (fileText: string) => any;
}

export const LoadButton: React.StatelessComponent<LoadButtonProps> = ({ onLoadFile, children }) => (
	e(React.Fragment,
		{},
		e(LoadButtonLabel,
			{
				htmlFor: 'upload-file',
			},
			children),
		e('input',
			{
				id: 'upload-file',
				type: 'file',
				accept: '.vsynth,.json',
				style: {
					display: 'none',
				},
				onChange: (evt: React.ChangeEvent<HTMLInputElement>) => {
					const fileList = evt.currentTarget.files;
					if (fileList == null || fileList.length < 1) {
						return;
					}
					const reader = new FileReader();
					reader.readAsText(fileList[0]);
					reader.onload = (evt: FileReaderProgressEvent) => {
						if (evt.target != null) {
							onLoadFile(evt.target.result);
						}
					};
				}
			})));

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

export const SavingUnsupportedWarning = styled.div`
	color: red;
	background-color: black;
	padding: 1em;

	text-align: center;
`;


const ExampleContainer = styled.div`
`;

interface ExampleThumbnailProps {
	example: Example;
	onClick: () => any;
}

const ExampleThumbnail: React.StatelessComponent<ExampleThumbnailProps> = ({
	example, onClick
}) => (
	e('div',
		{},
		e('button',
			{ onClick },
			example.name)));

interface ExamplesProps {
	load: (fileText: string) => any;
}

export const Examples: React.StatelessComponent<ExamplesProps> = ({ load }) => (
	e(ExampleContainer,
		{},
		e('h1', {}, 'Load an example patch'),
		e('ul',
			{},
			defaultExamples.map(example => 
				e(ExampleThumbnail,
					{
						key: example.name,
						example,
						onClick: () => load(example.file),
					})))));

