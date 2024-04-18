import React, { useEffect } from "react";
import loading from '../../assets/images/icon-loader.svg';
import { SvgHelper } from "./SvgHelper";
import ProgressBar from 'react-bootstrap/ProgressBar';
const Loader = ({ now }: { now: any }) => {
    return (
        <>
            <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100 position-absolute top-0 start-0">
                <SvgHelper src={loading} width='100' height="100" title="loading"></SvgHelper>
                {
                    now ?
                        <div className="w-25 mt-8">
                            <ProgressBar now={now} label={`${now}%`} />
                        </div>
                        : <></>
                }
            </div>
        </>
    );
};
export default Loader;
