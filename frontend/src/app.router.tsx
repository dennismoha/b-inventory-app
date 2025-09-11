import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FeatureModule from './feature-module/feature-module';
import { authRoutes, posPages, unAuthRoutes } from './routes/path';
import { base_path } from './environment';
import type { ReactElement } from 'react';

// import { useAppSelector } from './core/redux/store';
import PrivateRoute from './utils/api/privateroutes';

export type AppRoute = {
  id?: number;
  path: string;
  name: string;
  element: ReactElement;
  route?: typeof Route; // optional, assuming you want to reference the Route component itself
};

// const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//   const accessToken = useAppSelector((state) => state.auth.accessToken);
//   console.log('Access Token:', accessToken);

//   if (!accessToken) {
//     return <Navigate to="/signin" replace />;
//   }

//   return children;
// };

const AppRouter: React.FC = () => {
  const RouterContent = React.memo(() => {
    const renderRoutes = (routeList: AppRoute[], isProtected: boolean) =>
      // routeList?.map((item) => <Route key={`route-${item?.id}`} path={item?.path} element={item?.element} />);
      routeList?.map((item) => {
        const Element = isProtected ? <PrivateRoute>{item?.element}</PrivateRoute> : item?.element;
        return <Route key={`route-${item?.id}`} path={item?.path} element={Element} />;
      });

    return (
      <>
        <Routes>
          <Route path="/" element={<FeatureModule />}>
            {renderRoutes(unAuthRoutes, false)}
            {renderRoutes(authRoutes, true)}
            {renderRoutes(posPages, true)}
          </Route>
        </Routes>
      </>
    );
  });

  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;
