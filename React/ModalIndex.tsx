import React from "react";
import { useModal } from "../../contexts/ModalContext";

export const ModalIndex = () => {
  const { modalState, modalDispatch } = useModal();
  return (
    <>
      {
        modalState.showModal && <div>
          <h1>Modal</h1>
          <button onClick={() => modalDispatch({ modalState: "hide_modal" })}>
            close
          </button>
        </div>
      }
    </>
  );
};
