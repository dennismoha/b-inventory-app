import { useEffect, useState } from 'react';
import { Button, Toast } from 'react-bootstrap';

const Toasts = (issuccess: boolean) => {
  const [showSolidWarningToast, setShowSolidWarningToast] = useState(false);

  const handleSolidWarningToastClose = () => {
    setShowSolidWarningToast(false);
  };

  if (issuccess) {
    setShowSolidWarningToast(true);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSolidWarningToast(false);
    }, 6000);
    return () => clearTimeout(timeoutId);
  }, [showSolidWarningToast]);

  return (
    <Toast
      show={showSolidWarningToast}
      onClose={handleSolidWarningToastClose}
      id="solidWarningToast"
      className="colored-toast bg-warning text-fixed-white"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Toast.Header closeButton className="bg-warning text-fixed-white">
        <strong className="me-auto">Toast</strong>
        <Button variant="close" onClick={handleSolidWarningToastClose} aria-label="Close" />
      </Toast.Header>
      <Toast.Body>
        {/* Add your toast content here */}
        Your toast message here.
      </Toast.Body>
    </Toast>
  );
};

export default Toasts;
