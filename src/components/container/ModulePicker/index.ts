import * as React from 'react';
import styled from '../../../styled-components';
import * as Kit from '../../../model/Kit';

const e = React.createElement;

const ModuleList = styled.ul`
	margin: 0;
	padding: 0;
	
	display: grid;

	grid-template-columns: 50% 50%;
`;

const ModuleButton = styled.button`
	background: none;
	border: none;

	width: 100%;
	height: 100%;
	margin: 0;
	padding: 20px 0;

	background-color: black;
	border: 2px solid white;
	border-radius: 4px;
	color: white;

	&:hover {
		background-color: #555;
	}
`;

const ModuleEntry = styled.li`
	list-style-type: none;
	margin: 10px;
`;

interface Props {
	addModule: (modType: Kit.ModuleType) => any;
}

const ModulePicker: React.StatelessComponent<Props> = ({ addModule }) =>
	e(ModuleList,
		{},
		...Kit.moduleKeys.map(key =>
			e(ModuleEntry,
				{},
				e(ModuleButton,
					{
						onClick: () => addModule(key)
					},
					key))));

export default ModulePicker;

