import * as React from 'react';
import { modules, ModuleType } from '../../../model/Kit';

const e = React.createElement;

interface Props {
	addModule: (modType: ModuleType) => any;
}

const allModuleKeys = Object.keys(modules)
	.filter(moduleKey => [
		'identity',
		'pro-osc'
	].indexOf(moduleKey) === -1) as ModuleType[];

const ModulePicker: React.StatelessComponent<Props> = ({ addModule }) =>
	e('ul',
		{},
		...allModuleKeys.map(key =>
			e('li',
				{},
				e('button',
					{
						onClick: () => addModule(key)
					},
					key))));

export default ModulePicker;

