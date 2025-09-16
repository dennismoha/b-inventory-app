import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { setCredentials } from '@core/redux/authslice';
import { useLoginMutation as useSigninMutation } from '@core/redux/api/inventory-api';
import { all_routes as route } from '@routes/all_routes';
import {
  //  appleLogo,    facebookLogo, googleLogo,
  logoPng,
  logoWhitePng
} from '../../../../utils/imagepath';

// import logoPng from '@assets/logo.png';
// import logoWhitePng from '@assets/logo-white.png';
// import facebookLogo from '@assets/facebook.png';
// import googleLogo from '@assets/google.png';
// import appleLogo from '@assets/apple.png';

const Signin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { accessToken, user } = useAppSelector((state) => state.auth);

  const [signin, { isLoading, isError, error }] = useSigninMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // where to redirect after login
  const from = location.state?.from?.pathname || null;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signin({ email, password }).unwrap();
      dispatch(setCredentials({ user: response.user, accessToken: response.token }));
    } catch (err) {
      console.error('Signin failed:', err);
    }
  };

  // Redirect if already logged in and user visits signin
  useEffect(() => {
    if (accessToken && user?.role) {
      navigate(from || (user.role === 'admin' ? route.dashboard : route.pos), { replace: true });
    }
  }, [accessToken, user, navigate, from]);

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content authent-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <img src={logoPng} alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <img src={logoWhitePng} alt="Img" />
                </Link>
                <div className="login-userheading">
                  <h3>Sign In</h3>
                  <h4 className="fs-16">Access the Dreamspos panel using your email and passcode.</h4>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">
                    Email <span className="text-danger"> *</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control border-end-0"
                      placeholder="Enter your email"
                    />
                    <span className="input-group-text border-start-0">
                      <i className="ti ti-mail" />
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">
                    Password <span className="text-danger"> *</span>
                  </label>
                  <div className="pass-group">
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pass-input form-control"
                      placeholder="Enter your password"
                    />
                    <span
                      className={`ti toggle-password text-gray-9 ${isPasswordVisible ? 'ti-eye' : 'ti-eye-off'}`}
                      onClick={togglePasswordVisibility}
                      style={{ cursor: 'pointer' }}
                    ></span>
                  </div>
                </div>

                {/* Error */}
                {isError && <div className="text-danger mb-2">{(error as any)?.data?.message || 'Login failed'}</div>}

                {/* Remember Me */}
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
                          <input type="checkbox" className="form-control" />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link className="text-orange fs-16 fw-medium" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="form-login">
                  <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>

                {/* Register */}
                {/* <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {' '}
                      Create an account
                    </Link>
                  </h4>
                </div> */}

                {/* OR */}
                {/* <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div> */}

                {/* Social */}
                {/* <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center flex-wrap">
                    <div className="text-center me-2 flex-fill">
                      <Link to="#" className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center">
                        <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                      </Link>
                    </div>
                    <div className="text-center me-2 flex-fill">
                      <Link to="#" className="btn btn-white br-10 p-2 border d-flex align-items-center justify-content-center">
                        <img className="img-fluid m-1" src={googleLogo} alt="google" />
                      </Link>
                    </div>
                    <div className="text-center flex-fill">
                      <Link to="#" className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center">
                        <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
                      </Link>
                    </div>
                  </div>
                </div> */}

                {/* Footer */}
                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2025 DreamsPOS</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '@core/redux/store';

// import { useLoginMutation } from '@core/redux/api/inventory-api';
// import { setCredentials } from '@core/redux/authslice';
// import { all_routes as route } from '@routes/all_routes'; // Adjust to your actual path

// const Signin = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { accessToken, user } = useAppSelector((state) => state.auth);
//   const [signin, { isLoading, error }] = useLoginMutation();

//   const [formData, setFormData] = useState({ email: '', password: '' });

//   // Figure out where to go after login
//   const from = location.state?.from?.pathname || null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await signin(formData).unwrap();
//       dispatch(setCredentials({ user: response.user, accessToken: response.token }));
//     } catch (err) {
//       console.error('Signin failed:', err);
//     }
//   };

//   // Redirect logic after auth state updates
//   useEffect(() => {
//     if (accessToken && user?.role) {
//       if (from) {
//         // If the user came from a protected page before login
//         navigate(from, { replace: true });
//       } else {
//         // Default redirect based on role
//         if (user.role === 'admin') {
//           navigate(route.dashboard, { replace: true });
//         } else if (user.role === 'user') {
//           navigate(route.pos, { replace: true });
//         } else {
//           navigate('/', { replace: true });
//         }
//       }
//     }
//   }, [accessToken, user, navigate, from]);

//   // If user is already logged in and tries to visit signin
//   useEffect(() => {
//     if (accessToken && user?.role) {
//       if (from) {
//         navigate(from, { replace: true });
//       } else {
//         if (user.role === 'admin') {
//           navigate(route.dashboard, { replace: true });
//         } else if (user.role === 'user') {
//           navigate(route.pos, { replace: true });
//         } else {
//           navigate('/', { replace: true });
//         }
//       }
//     }
//   }, []); // Runs once on mount

//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper bg-img">
//           <div className="login-content authent-content">
//             <form onSubmit={handleSubmit}>
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <img src={logoPng} alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <img src={logoWhitePng} alt="Img" />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Sign In</h3>
//                   <h4 className="fs-16">Access the Dreamspos panel using your email and passcode.</h4>
//                 </div>

//                 {/* Email */}
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Email <span className="text-danger"> *</span>
//                   </label>
//                   <div className="input-group">
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="form-control border-end-0"
//                       placeholder="Enter your email"
//                     />
//                     <span className="input-group-text border-start-0">
//                       <i className="ti ti-mail" />
//                     </span>
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Password <span className="text-danger"> *</span>
//                   </label>
//                   <div className="pass-group">
//                     <input
//                       type={isPasswordVisible ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       className="pass-input form-control"
//                       placeholder="Enter your password"
//                     />
//                     <span
//                       className={`ti toggle-password text-gray-9 ${isPasswordVisible ? 'ti-eye' : 'ti-eye-off'}`}
//                       onClick={togglePasswordVisibility}
//                       style={{ cursor: 'pointer' }}
//                     ></span>
//                   </div>
//                 </div>

//                 {/* Optional: Error Message */}
//                 {isError && <div className="text-danger mb-2">{(error as any)?.data?.message || 'Login failed'}</div>}

//                 {/* Remember Me & Forgot Password */}
//                 <div className="form-login authentication-check">
//                   <div className="row">
//                     <div className="col-12 d-flex align-items-center justify-content-between">
//                       <div className="custom-control custom-checkbox">
//                         <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
//                           <input type="checkbox" className="form-control" />
//                           <span className="checkmarks" />
//                           Remember me
//                         </label>
//                       </div>
//                       <div className="text-end">
//                         <Link className="text-orange fs-16 fw-medium" to={route.forgotPassword}>
//                           Forgot Password?
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="form-login">
//                   <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
//                     {isLoading ? 'Signing In...' : 'Sign In'}
//                   </button>
//                 </div>

//                 {/* Register */}
//                 <div className="signinform">
//                   <h4>
//                     New on our platform?
//                     <Link to={route.register} className="hover-a">
//                       {' '}
//                       Create an account
//                     </Link>
//                   </h4>
//                 </div>

//                 {/* OR */}
//                 <div className="form-setlogin or-text">
//                   <h4>OR</h4>
//                 </div>

//                 {/* Social Buttons */}
//                 <div className="mt-2">
//                   <div className="d-flex align-items-center justify-content-center flex-wrap">
//                     <div className="text-center me-2 flex-fill">
//                       <Link to="#" className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
//                       </Link>
//                     </div>
//                     <div className="text-center me-2 flex-fill">
//                       <Link to="#" className="btn btn-white br-10 p-2  border d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={googleLogo} alt="google" />
//                       </Link>
//                     </div>
//                     <div className="text-center flex-fill">
//                       <Link to="#" className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
//                       </Link>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
//                   <p>Copyright © 2025 DreamsPOS</p>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//     // <div className="signin-container">
//     //   <form onSubmit={handleSubmit}>
//     //     <h1>Sign In</h1>
//     //     <input
//     //       type="email"
//     //       placeholder="Email"
//     //       value={formData.email}
//     //       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//     //       required
//     //     />
//     //     <input
//     //       type="password"
//     //       placeholder="Password"
//     //       value={formData.password}
//     //       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//     //       required
//     //     />
//     //     <button type="submit" disabled={isLoading}>
//     //       {isLoading ? 'Signing in...' : 'Sign In'}
//     //     </button>
//     //     {error && <p className="error">Invalid credentials</p>}
//     //   </form>
//     // </div>
//   );
// };

// export default Signin;

// import React, { useState } from 'react';
// import { Link, Navigate, useNavigate } from 'react-router-dom';
// import { all_routes } from '../../../../routes/all_routes';
// import { appleLogo, facebookLogo, googleLogo, logoPng, logoWhitePng } from '../../../../utils/imagepath';
// import { useLoginMutation } from '@core/redux/api/inventory-api';
// import { useAppDispatch, useAppSelector } from '@core/redux/store';
// import { setCredentials } from '@core/redux/authslice';

// const Signin: React.FC = () => {
//   const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [login, { isLoading, isError, error }] = useLoginMutation();
//   const navigate = useNavigate();
//   const route = all_routes;

//   const dispatch = useAppDispatch();
//   const togglePasswordVisibility = (): void => {
//     setPasswordVisible((prevState: boolean) => !prevState);
//   };

//   const accessToken = useAppSelector((state) => state.auth.accessToken);
//   const user = useAppSelector((state) => state.auth.user);
//   console.log('Access Token om logiiin:', accessToken);
//   if (accessToken && user.role === 'admin') {
//     return <Navigate to="/index" replace />;
//   } else if (accessToken && user.role === 'user') {
//     return <Navigate to="/pos" replace />;
//   }

//   // const route = all_routes;

//   const handleSubmit = async (event: React.FormEvent): Promise<void> => {
//     event.preventDefault();
//     try {
//       const response = await login({ email, password }).unwrap();
//       console.log('Login success:', response);
//       // You can store the token here (optional)
//       dispatch(
//         setCredentials({
//           user: response.user,
//           accessToken: response.token
//         })
//       );

//       // if (response.user.posSession) {
//       //   localStorage.setItem('posSession', response.user.posSession);
//       // }

//       // if (!response.user.posSession) {
//       //   // localStorage.removeItem('posSession');
//       //   // <PosModals />;
//       //   // window.confirm('No active POS session found. Please start a new session.');
//       //   if (confirm('No active POS session found. Please start a new session.')) {
//       //     alert('confirmed');
//       //   } else {
//       //     alert('not confirmed');
//       //   }
//       //   // alert('No active POS session found. Please start a new session.');
//       // }

//       if (response.user.role === 'admin') {
//         navigate(route.dashboard); // Redirect to admin dashboard
//       } else if (response.user.role === 'user') {
//         navigate(route.pos); // Redirect to POS page
//       }

//       // navigate(route.newdashboard); // Redirect on success
//     } catch (err) {
//       console.error('Login error:', err);
//       // Optional: show error toast or UI feedback
//     }
//   };

//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper bg-img">
//           <div className="login-content authent-content">
//             <form onSubmit={handleSubmit}>
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <img src={logoPng} alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <img src={logoWhitePng} alt="Img" />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Sign In</h3>
//                   <h4 className="fs-16">Access the Dreamspos panel using your email and passcode.</h4>
//                 </div>

//                 {/* Email */}
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Email <span className="text-danger"> *</span>
//                   </label>
//                   <div className="input-group">
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="form-control border-end-0"
//                       placeholder="Enter your email"
//                     />
//                     <span className="input-group-text border-start-0">
//                       <i className="ti ti-mail" />
//                     </span>
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Password <span className="text-danger"> *</span>
//                   </label>
//                   <div className="pass-group">
//                     <input
//                       type={isPasswordVisible ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       className="pass-input form-control"
//                       placeholder="Enter your password"
//                     />
//                     <span
//                       className={`ti toggle-password text-gray-9 ${isPasswordVisible ? 'ti-eye' : 'ti-eye-off'}`}
//                       onClick={togglePasswordVisibility}
//                       style={{ cursor: 'pointer' }}
//                     ></span>
//                   </div>
//                 </div>

//                 {/* Optional: Error Message */}
//                 {isError && <div className="text-danger mb-2">{(error as any)?.data?.message || 'Login failed'}</div>}

//                 {/* Remember Me & Forgot Password */}
//                 <div className="form-login authentication-check">
//                   <div className="row">
//                     <div className="col-12 d-flex align-items-center justify-content-between">
//                       <div className="custom-control custom-checkbox">
//                         <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
//                           <input type="checkbox" className="form-control" />
//                           <span className="checkmarks" />
//                           Remember me
//                         </label>
//                       </div>
//                       <div className="text-end">
//                         <Link className="text-orange fs-16 fw-medium" to={route.forgotPassword}>
//                           Forgot Password?
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="form-login">
//                   <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
//                     {isLoading ? 'Signing In...' : 'Sign In'}
//                   </button>
//                 </div>

//                 {/* Register */}
//                 <div className="signinform">
//                   <h4>
//                     New on our platform?
//                     <Link to={route.register} className="hover-a">
//                       {' '}
//                       Create an account
//                     </Link>
//                   </h4>
//                 </div>

//                 {/* OR */}
//                 <div className="form-setlogin or-text">
//                   <h4>OR</h4>
//                 </div>

//                 {/* Social Buttons */}
//                 <div className="mt-2">
//                   <div className="d-flex align-items-center justify-content-center flex-wrap">
//                     <div className="text-center me-2 flex-fill">
//                       <Link to="#" className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
//                       </Link>
//                     </div>
//                     <div className="text-center me-2 flex-fill">
//                       <Link to="#" className="btn btn-white br-10 p-2  border d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={googleLogo} alt="google" />
//                       </Link>
//                     </div>
//                     <div className="text-center flex-fill">
//                       <Link to="#" className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center">
//                         <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
//                       </Link>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
//                   <p>Copyright © 2025 DreamsPOS</p>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
//   // return (
//   //   <>
//   //     {/* Main Wrapper */}
//   //     <div className="main-wrapper">
//   //       <div className="account-content">
//   //         <div className="login-wrapper bg-img">
//   //           <div className="login-content authent-content">
//   //             <form onSubmit={handleSubmit}>
//   //               <div className="login-userset">
//   //                 <div className="login-logo logo-normal">
//   //                   <img src={logoPng} alt="img" />
//   //                 </div>
//   //                 <Link to={route.dashboard} className="login-logo logo-white">
//   //                   <img src={logoWhitePng} alt="Img" />
//   //                 </Link>
//   //                 <div className="login-userheading">
//   //                   <h3>Sign In</h3>
//   //                   <h4 className="fs-16">Access the Dreamspos panel using your email and passcode.</h4>
//   //                 </div>
//   //                 <div className="mb-3">
//   //                   <label className="form-label">
//   //                     Email <span className="text-danger"> *</span>
//   //                   </label>
//   //                   <div className="input-group">
//   //                     <input type="text" defaultValue="" className="form-control border-end-0" />
//   //                     <span className="input-group-text border-start-0">
//   //                       <i className="ti ti-mail" />
//   //                     </span>
//   //                   </div>
//   //                 </div>
//   //                 <div className="mb-3">
//   //                   <label className="form-label">
//   //                     Password <span className="text-danger"> *</span>
//   //                   </label>
//   //                   <div className="pass-group">
//   //                     <input type={isPasswordVisible ? 'text' : 'password'} className="pass-input form-control" />
//   //                     <span
//   //                       className={`ti toggle-password text-gray-9 ${isPasswordVisible ? 'ti-eye' : 'ti-eye-off'}`}
//   //                       onClick={togglePasswordVisibility}
//   //                     ></span>
//   //                   </div>
//   //                 </div>
//   //                 <div className="form-login authentication-check">
//   //                   <div className="row">
//   //                     <div className="col-12 d-flex align-items-center justify-content-between">
//   //                       <div className="custom-control custom-checkbox">
//   //                         <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
//   //                           <input type="checkbox" className="form-control" />
//   //                           <span className="checkmarks" />
//   //                           Remember me
//   //                         </label>
//   //                       </div>
//   //                       <div className="text-end">
//   //                         <Link className="text-orange fs-16 fw-medium" to={route.forgotPassword}>
//   //                           Forgot Password?
//   //                         </Link>
//   //                       </div>
//   //                     </div>
//   //                   </div>
//   //                 </div>
//   //                 <div className="form-login">
//   //                   <Link to={route.newdashboard} className="btn btn-primary w-100">
//   //                     Sign In
//   //                   </Link>
//   //                 </div>
//   //                 <div className="signinform">
//   //                   <h4>
//   //                     New on our platform?
//   //                     <Link to={route.register} className="hover-a">
//   //                       {' '}
//   //                       Create an account
//   //                     </Link>
//   //                   </h4>
//   //                 </div>
//   //                 <div className="form-setlogin or-text">
//   //                   <h4>OR</h4>
//   //                 </div>
//   //                 <div className="mt-2">
//   //                   <div className="d-flex align-items-center justify-content-center flex-wrap">
//   //                     <div className="text-center me-2 flex-fill">
//   //                       <Link to="#" className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center">
//   //                         <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
//   //                       </Link>
//   //                     </div>
//   //                     <div className="text-center me-2 flex-fill">
//   //                       <Link to="#" className="btn btn-white br-10 p-2  border d-flex align-items-center justify-content-center">
//   //                         <img className="img-fluid m-1" src={googleLogo} alt="google" />
//   //                       </Link>
//   //                     </div>
//   //                     <div className="text-center flex-fill">
//   //                       <Link to="#" className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center">
//   //                         <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
//   //                       </Link>
//   //                     </div>
//   //                   </div>
//   //                 </div>
//   //                 <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
//   //                   <p>Copyright © 2025 DreamsPOS</p>
//   //                 </div>
//   //               </div>
//   //             </form>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //     {/* /Main Wrapper */}
//   //   </>
//   // );
// };

// export default Signin;
