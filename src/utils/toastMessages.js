import { toast } from 'react-toastify';

const defaultOptions = {
  position: 'top-right',
  autoClose: 4000,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
  theme: 'light',
};


export const showSuccess = (message) => {
  toast.success(message, defaultOptions);
};

export const showError = (message) => {
  toast.error(message, defaultOptions);
};

export const showInfo = (message) => {
  toast.info(message, defaultOptions);
};

export const showWarning = (message) => {
  toast.warn(message, defaultOptions);
};
export const showAlert = (message) => {
  toast(message, {
    position: 'top-right',
    autoClose: false, // stays until manually closed
    closeOnClick: true,
    draggable: true,
    theme: 'light',
    progressClassName: 'custom-toast-progress',
    style: {
      background: '#fff',
      color: '#000',
      borderLeft: '6px solid orange',
      fontWeight: 'bold'
    }
  });
};
