import React, { useCallback, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import { useDataContext } from '../../../contexts/DataContext';
import { useDescope } from '@descope/react-sdk';


const ShowDeleteModal = ({ show, setShow, isLogout, setIsLogout }: { show: any, setShow: any, isLogout: any, setIsLogout: any }) => {
    const navigate = useNavigate();
    const { logout } = useDescope();
    function toggleBodyClass(className: string): void {
        let body = document.querySelector('body');
        if (body?.classList.contains(className)) {
            body?.classList.remove(className);
        } else {
            body?.classList.add(className);
        }
    }
    const { articleData, setArticleData } = useDataContext();
    const handleClose = () => setShow(false);
    const handleOkClick = () => {
        if (isLogout) {
            handleLogout();
            setShow(false);
            setIsLogout(false);
        } else {
            navigate('/news-items');
            setShow(false);
            toggleBodyClass('aside-open');
            setArticleData({
                articleSettingsData: null,
                editorialData: null,
                videoSettingsData: null
            })
        }
    }
    const handleLogout: any = useCallback(() => {
        let body = document.querySelector('body');
        body?.classList.remove('aside-open');
        logout().then(() => {
            navigate('/');
            localStorage.clear();
        })
    }, [logout, navigate])
    return (
        <Modal className="modal-reporter overflow-hidden" show={show} onHide={handleClose} centered size="sm">
            <Modal.Body className="p-4 p-lg-8 d-flex flex-column overflow-hidden text-center">
                <h1>Notice!</h1>
                <h4 className='fw-normal mt-2'>Changes will be discarded</h4>
                <div className='d-flex gap-2 pt-4 pt-lg-8 justify-content-center'>
                    <Button className="px-4 px-md-6 px-md-10" variant="primary" onClick={() => { setShow(false); setIsLogout(false); }}>Cancel</Button>
                    <Button className="px-4 px-md-6 px-md-10" variant="dark" onClick={() => { handleOkClick() }}>Ok</Button>
                </div>
            </Modal.Body>
        </Modal >
    )
}

export default ShowDeleteModal