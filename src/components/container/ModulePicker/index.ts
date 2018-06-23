import * as React from 'react';
import * as Kit from '../../../model/Kit';

const e = React.createElement;

interface Props {
	addModule: (modType: Kit.ModuleType) => any;
}

const allModuleKeys = Kit.moduleKeys
	.filter(moduleKey => [
		'pro-osc',
		'dither',
		'crosshatch'
	].indexOf(moduleKey) === -1);

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

