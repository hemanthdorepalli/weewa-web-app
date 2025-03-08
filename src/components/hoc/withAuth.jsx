import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();
    
    useEffect(() => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Check if token and user exist
      if (!token || !user) {
        navigate('/login');
        return;
      }

      // No need for token verification request
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;