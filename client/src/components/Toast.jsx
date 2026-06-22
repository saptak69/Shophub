import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Toast = () => {
  const { toast } = useContext(CartContext);

  return (
    <div id="toast-notification" className={toast?.visible ? 'show' : ''}>
      {toast?.message}
    </div>
  );
};

export default Toast;
