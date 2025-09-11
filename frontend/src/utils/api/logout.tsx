// LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryApi, useLazyLogoutQuery } from '@core/redux/api/inventory-api'; // or useLogoutMutation if it's a mutation

import { all_routes as route } from '@routes/all_routes';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { setClearCredentials } from '@core/redux/authslice';

const LogoutButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logout] = useLazyLogoutQuery();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      if (accessToken) {
        await logout().unwrap(); // only call if logged in
      }
      await dispatch(InventoryApi.util.resetApiState());
      dispatch(setClearCredentials()); // synchronous
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate(route.signin, { replace: true });
    }
  };

  return (
    <button className="dropdown-item logout pb-0" onClick={handleLogout}>
      <i className="ti ti-logout me-2" />
      logout
    </button>
  );
};

// // LogoutButton.tsx
// import React, { useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { InventoryApi, useLazyLogoutQuery } from '@core/redux/api/inventory-api'; // or useLogoutMutation if it's a mutation

// import { all_routes as route } from '@routes/all_routes';
// import { useAppDispatch, useAppSelector } from '@core/redux/store';
// import { setClearCredentials } from '@core/redux/authslice';

// const LogoutButton: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   const [logout] = useLazyLogoutQuery(undefined);

//   const accessToken = useAppSelector((state) => state.auth.accessToken);
//   console.log('=================Access Token on logout::::::', accessToken);
//   useEffect(() => {
//     if (!accessToken) {
//       navigate(route.signin, { replace: true });
//     }
//     console.log('=================Access Token on logout:', accessToken);
//   }, [accessToken, navigate]);

//   const handleLogout = async (e: React.MouseEvent) => {
//     e.preventDefault();

//     try {
//       await logout(); // send logout request to server
//       await dispatch(InventoryApi.util.resetApiState()); // reset the API state
//       // Clear state and redirect
//       await dispatch(setClearCredentials());
//     } catch (err) {
//       console.error('Logout error:', err);
//     }
//     //  finally {
//     //   // Redirect to the sign-in page after logout
//     //   navigate(route.signin, { replace: true });
//     // }
//   };

//   return (
//     <Link className="dropdown-item logout pb-0" to={route.signin} onClick={handleLogout}>
//       <i className="ti ti-logout me-2" />
//       logout
//     </Link>
//   );
// };

export default LogoutButton;
