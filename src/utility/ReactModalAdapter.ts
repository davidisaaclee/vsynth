import * as React from 'react';
import * as ReactModal from 'react-modal';

const e = React.createElement;

interface Props extends ReactModal.Props {
	className?: string;
	modalClassName?: string;
}

const ReactModalAdapter: React.StatelessComponent<Props> = ({ className, modalClassName, children, ...props }) =>
	e(ReactModal,
		{
			className: modalClassName,
			portalClassName: className,
			...props
		},
		children);

export default ReactModalAdapter;

