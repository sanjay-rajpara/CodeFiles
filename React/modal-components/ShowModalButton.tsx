import React from 'react'
import { useModal } from '../../../contexts/ModalContext'

export interface ShowModalButtonProps {
	label?: string,
}

export const ShowModalButton = (props: ShowModalButtonProps) => {
	const {modalDispatch} = useModal();

	return (
		<span onClick={() => modalDispatch({modalState: 'show_modal'})}>{props?.label || 'Click to Show Modal'}</span>
	)
}
