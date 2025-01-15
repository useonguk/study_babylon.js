import React from 'react';

const Modal = ({ carName, carBattery, onClose }) => {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h2>{carName} 차량이 클릭되었습니다.</h2>
        <h3>{carBattery}남음</h3>
        <button onClick={onClose} style={styles.closeButton}>닫기</button>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
    minWidth: '300px',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Modal;
