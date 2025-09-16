import React, { useEffect, useRef, type JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { useGetCurrentUserQuery } from '@core/redux/api/inventory-api';
import { setClearCredentials, setCredentials } from '@core/redux/authslice';
import { publicPaths, roleRules } from '../constants';
import { all_routes as route } from '@routes/all_routes';
import PosSession from '../../feature-module/pos/pos-session';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const posSessionId = useAppSelector((state) => state.PosSession.posSessionId);
  const isAuthReady = useAppSelector((s) => s._persist?.rehydrated);

  const shouldFetchUser = Boolean(accessToken && isAuthReady);
  const { data, isLoading, isFetching, error } = useGetCurrentUserQuery(undefined, {
    skip: !shouldFetchUser
  });

  console.log('access token ', accessToken ? accessToken : 'no access token');
  console.log('is auth ready ', isAuthReady);
  console.log('should fetch user is ', shouldFetchUser);

  const hasSetCredsRef = useRef(false);

  // Set credentials once when user data is loaded
  useEffect(() => {
    if (data?.user && !hasSetCredsRef.current) {
      hasSetCredsRef.current = true;
      dispatch(setCredentials({ user: data.user, accessToken: data.token! }));
    }
  }, [data, dispatch]);

  // Handle auth error OUTSIDE of render
  useEffect(() => {
    if (error) {
      console.log('Auth error in PrivateRoute:', error);
      dispatch(setClearCredentials());
    }
  }, [error, dispatch]);

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  // Public paths
  if (publicPaths.some((pattern) => pattern.test(location.pathname))) {
    return children;
  }

  // Must be logged in
  if (!accessToken) {
    return <Navigate to={route.signin} replace />;
  }

  // Must have active POS session
  if (!posSessionId) {
    return <PosSession />;
  }

  // Role-based access control
  const matchedRule = roleRules.find((rule) => rule.pattern.test(location.pathname));
  if (matchedRule && !matchedRule.roles.includes(user.role)) {
    return <Navigate to={route.blankpage} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={route.blankpage} replace />;
  }

  return children;
};

// export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
//   const dispatch = useAppDispatch();
//   const location = useLocation();

//   const accessToken = useAppSelector((s) => s.auth.accessToken);
//   const user = useAppSelector((s) => s.auth.user);
//   const posSessionId = useAppSelector((state) => state.PosSession.posSessionId);

//   const isAuthReady = useAppSelector((s) => s._persist?.rehydrated); // redux-persist flag

//   const shouldFetchUser = Boolean(accessToken && isAuthReady);
//   const { data, isLoading, isFetching, error } = useGetCurrentUserQuery(undefined, {
//     skip: !shouldFetchUser
//   });
//   const hasSetCredsRef = useRef(false);

//   useEffect(() => {
//     console.log('access token ', accessToken ? accessToken : 'no access token');
//   }, []);

//   useEffect(() => {
//     console.log('in private route accessToken is ', accessToken);
//     if (data?.user && !hasSetCredsRef.current) {
//       hasSetCredsRef.current = true;
//       dispatch(setCredentials({ user: data.user, accessToken: data.token! }));
//     }
//   }, [data, dispatch]);

//   if (isLoading || isFetching) {
//     return <div>Loading...</div>; // could be a spinner
//   }

//   // Handle auth error
//   if (error) {
//     console.log('error in private route is ', error);
//     dispatch(setClearCredentials());
//     return <Navigate to={route.signin} replace />;
//   }

//   // Public paths (skip auth checks)
//   if (publicPaths.some((pattern) => pattern.test(location.pathname))) {
//     return children;
//   }

//   // Must be logged in
//   if (!accessToken) {
//     return <Navigate to={route.signin} replace />;
//   }

//   // Must have active POS session
//   if (!posSessionId) {
//     return <PosSession />;
//   }

//   // Role-based access control
//   const matchedRule = roleRules.find((rule) => rule.pattern.test(location.pathname));
//   if (matchedRule && !matchedRule.roles.includes(user.role)) {
//     return <Navigate to={route.blankpage} replace />;
//   }
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to={route.blankpage} replace />;
//   }

//   return children;
// };

export default React.memo(PrivateRoute);

// /**
//  * Now this is the private route that should check at all times if PosSession is set in state.
//  *  if not render the PosSession component.
//  * if yes move on to the rest of the routes.
//  *
//  * optimize it as above we have done before.
//  *
//  */

// import { Navigate, Route, useLocation } from 'react-router-dom';

// import { useEffect, useState, type JSX, type ReactElement } from 'react';
// import { useAppDispatch, useAppSelector } from '@core/redux/store';
// import { useGetCurrentUserQuery } from '@core/redux/api/inventory-api';
// import { setClearCredentials, setCredentials } from '@core/redux/authslice';
// import { publicPaths, roleRules } from '../constants';
// import { all_routes as route } from '@routes/all_routes';
// import PosSession from '../../feature-module/pos/pos-session';

// export type AppRoute = {
//   id?: number;
//   path: string;
//   name: string;
//   element: ReactElement;
//   route?: typeof Route; // optional, assuming you want to reference the Route component itself
// };

// interface PrivateRouteProps {
//   children: JSX.Element;
//   allowedRoles?: string[];
// }

// export const PrivateRoute = ({ children }: PrivateRouteProps) => {
//   const dispatch = useAppDispatch();
//   const accessToken = useAppSelector((state) => state.auth.accessToken);
//   const { user } = useAppSelector((state) => state.auth);
//   const [posSessionId, setPosSessionId] = useState<string | null>(null);
//   const location = useLocation();

//   // if (!accessToken) return <Navigate to="/signin" replace />;

//   const { data, isLoading, isFetching, error } = useGetCurrentUserQuery();

//   useEffect(() => {
//     if (data?.user) {
//       dispatch(setCredentials({ user: data.user, accessToken: data.token! }));
//     }
//   }, [data, dispatch]);

//   useEffect(() => {
//     const posSession = localStorage.getItem('pos_session_id');
//     if (posSession) {
//       const sessionData = JSON.parse(posSession);
//       setPosSessionId(sessionData);
//     }

//     if (!posSession) {
//       // If no POS session, redirect to POS session start page
//       setPosSessionId(null);
//       // Optionally, you can also show a modal or notification to the user
//       // setIsModalOpen(true);
//     }
//   }, []);

//   if (!posSessionId) {
//     // alert('No active POS session. Please start a session to continue.');
//     // return <Navigate to={route.possession} replace />;

//     return <PosSession />;
//   }

//   if (isLoading || isFetching) return <div>Loading...</div>;

//   if (error) {
//     dispatch(setClearCredentials());
//     // return <Navigate to={route.signin} replace />;
//     return <PosSession />;
//   }
//   if (publicPaths.some((pattern) => pattern.test(location.pathname))) {
//     return children;
//   }

//   if (!accessToken) return <Navigate to={route.signin} replace />;

//   // const section = Object.keys(roleRules).find((prefix) => location.pathname.startsWith(prefix));
//   const matchedRule = roleRules.find((rule) => rule.pattern.test(location.pathname));

//   // if (allowedRoles && !allowedRoles.includes(user.role)) {
//   //   return <Navigate to="/forbidden" replace />;
//   // }
//   // if (section) {
//   //   const allowedRoles = roleRules[section];
//   //   if (!allowedRoles.includes(user.role)) {
//   //     return <Navigate to="/blank-page" replace />;
//   //   }
//   // }

//   if (matchedRule && !matchedRule.roles.includes(user.role)) {
//     return <Navigate to={route.blankpage} replace />;
//   }
//   return children;
// };

// // const PrivateRoute = ({ children }: { children: JSX.Element }) => {
// //   const dispatch = useAppDispatch();
// //   const accessToken = useAppSelector((state) => state.auth.accessToken);
// //   // const [isUser, setIsUser] = useState(false);
// //   console.log('Access Token:', accessToken);
// //   const { data: getCurrentUser, isLoading, isFetching, error } = useGetCurrentUserQuery();
// //   useEffect(() => {
// //     if (getCurrentUser) {
// //       dispatch(
// //         setCredentials({
// //           user: getCurrentUser.user!,
// //           accessToken: getCurrentUser.token!
// //         })
// //       );
// //     }
// //   }, [getCurrentUser, dispatch]);

// //   // Wait until the query finishes
// //   if (isLoading || isFetching) {
// //     console.log('loading current user...');
// //     return <div>Loading...</div>; // Or a spinner component
// //   }
// //   if (error) {
// //     // will logout
// //     console.error('Error fetching current user:', error);
// //     dispatch(setClearCredentials());
// //     return <Navigate to="/signin" replace />;
// //   }
// //   console.log('Current User::::', getCurrentUser);
// //   if (!accessToken) {
// //     dispatch(setClearCredentials());
// //     // will also logout
// //     return <Navigate to="/signin" replace />;
// //   }

// //   //   dispatch(
// //   //     setCredentials({
// //   //       user: getCurrentUser.user!,
// //   //       accessToken: getCurrentUser.token!
// //   //     })
// //   //   );

// //   return children;
// // };

// // const PrivateRoute = ({ children }: { children: JSX.Element }) => {
// //   const accessToken = useAppSelector((state) => state.auth.accessToken);
// //   console.log('Access Token:', accessToken);

// //   if (!accessToken) {
// //     return <Navigate to="/signin" replace />;
// //   }

// //   return children;
// // };
// export default PrivateRoute;
