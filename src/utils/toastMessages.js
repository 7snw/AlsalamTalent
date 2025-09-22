import { toast } from 'react-toastify';

const defaultOptions = {
  position: 'bottom-right',
  autoClose: 2000, 
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
    position: 'bottom-right',
    autoClose: 3000,  
    closeOnClick: true,
    draggable: true,
    theme: 'light',
    progressClassName: 'custom-toast-progress',
    style: {
      background: '#fff',
      color: '#000',
      borderLeft: '5px solid #6dbbc7ff',
      fontWeight: 'bold'
    }
  });
};
