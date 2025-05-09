// NotificationService.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const notifySuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    theme: "colored",
  });
};

export const notifyInfo = (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      closeButton: false, // Remove close button
      theme: "colored",
      ...options
    });
  };
export const notifyError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    theme: "colored",
  });
};

export const notifyWarning = (message) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 3000,
    theme: "colored",
  });
};