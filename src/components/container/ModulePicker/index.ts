import * as React from 'react';
import { VideoModule, modules } from '../../../model/Kit';

const e = React.createElement;

interface Props {
	addModule: (mod: VideoModule) => any;
}

const allModuleKeys = Object.keys(modules);

const ModulePicker: React.StatelessComponent<Props> = ({ addModule }) =>
	e('ul',
		{},
		...allModuleKeys.map(key =>
			e('li',
				{},
				e('button',
					{
						onClick: () => addModule(modules[key])
					},
					key))));

export default ModulePicker;

