import * as React from 'react';
import styled from '../../../styled-components';
import * as Kit from '../../../model/Kit';

import { deviceQueries } from '../../../utility/mediaQueries';

const e = React.createElement;

const ModuleList = styled.ul`
	margin: 0;
	padding: 0;
	
	display: grid;

	grid-template-columns: 50% 50%;

	${deviceQueries.mobile`
		grid-template-columns: 100%;
	`}
`;

const ModuleButton = styled.button`
	background: none;
	border: none;

	width: 100%;
	height: 100%;
	margin: 0;
	padding: 20px;

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

const ModuleTitle = styled.h1`
	font-size: 14pt;
`;

const ModuleDescription = styled.h2`
	font-size: 10pt;
`;

interface Props {
	addModule: (modType: Kit.ModuleType) => any;
}

const ModulePicker: React.StatelessComponent<Props> = ({ addModule }) =>
	e(ModuleList,
		{},
		...Kit.moduleKeys.map(key => {
			const mod = Kit.moduleForType(key)!;

			return e(ModuleEntry,
				{},
				e(ModuleButton,
					{ onClick: () => addModule(key) },
					e(ModuleTitle, {}, mod.name),
					e(ModuleDescription,
						{},
						mod.description)))
		}));

export default ModulePicker;

