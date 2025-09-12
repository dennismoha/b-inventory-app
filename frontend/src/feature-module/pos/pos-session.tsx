import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../routes/all_routes';
import { useCheckPosSessionQuery, useStartPosSessionMutation } from '@core/redux/api/inventory-api';
import { setPosSessionId } from '@core/redux/pos-session';
import { useAppDispatch, useAppSelector } from '@core/redux/store';

const PosSession = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get session token from Redux
  const posSessionId = useAppSelector((state) => state.PosSession.posSessionId);

  // Query backend for session if we don't have it in Redux
  const { data, isLoading, error, refetch } = useCheckPosSessionQuery(undefined, {
    skip: !!posSessionId
  });

  // Mutation to start a new session
  const [startPosSession, { isLoading: creating, isError: createError, error: mutationError }] = useStartPosSessionMutation();

  // Store session from query into Redux when found
  useEffect(() => {
    if (data?.data.pos_session_id && !posSessionId) {
      console.log('Storing POS session ID in Redux:', data?.data.pos_session_id);
      dispatch(setPosSessionId({ pos_session_id: data?.data.pos_session_id }));
      navigate(all_routes.pos); // redirect to POS page
    }
  }, [data, posSessionId, dispatch, navigate]);

  // Handle start session click
  const startPosSessionHandler = async () => {
    try {
      const res = await startPosSession({}).unwrap();
      dispatch(setPosSessionId(res.posSessionId));
      navigate(all_routes.pos);
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="main-wrapper">
        <div className="error-box">
          <h3 className="h2 mb-3">Loading...</h3>
        </div>
      </div>
    );
  }

  // Error handling
  if (error) {
    // No session found → ask to create one
    return (
      <div className="page-wrapper pagehead">
        <div className="content">
          <h4>No POS Session Found</h4>
          <p>{error.message || 'You need to start a session before proceeding.'}</p>
          <button className="btn btn-secondary" onClick={() => refetch()}>
            Retry
          </button>
          <div>
            {creating ? (
              <button className="btn btn-dark" disabled>
                Starting...
              </button>
            ) : (
              <button className="btn btn-primary" onClick={startPosSessionHandler}>
                Start Session
              </button>
            )}
          </div>
          {createError && <p className="text-danger">{mutationError?.message || 'Error starting session'}</p>}
        </div>
      </div>
    );
  }

  // If session exists already
  if (posSessionId || data?.data.pos_session_id) {
    return (
      <div className="card bg-white border-0">
        <div className="alert custom-alert1 alert-secondary">
          <div className="text-center px-5 pb-0">
            <div className="custom-alert-icon">
              <i className="feather-check-circle flex-shrink-0" />
            </div>
            <h5>Session Confirmed</h5>
            <p>Session is active and ready.</p>
            <Link className="btn btn-sm btn-secondary m-1" to={all_routes.pos}>
              Go to POS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PosSession;

/***
 *
 * This component acts as the middleware for checking if the pos_session_id exists.  every authenticated route paases through here
 *
 * so when loaded it should check if token exists on state using the use selector.
 * if it does then we should continue
 *
 * if not it should call the useCheckPossession query to the backend and check if a session exists.
 * if it returns with data then we should use useDispatch to dispatch the session to the state where it will be stored.
 *
 * if it returns 404 error, it means that pos_session_id was not found.
 * we should load a ui to ask the user to create a pos_Session_id.
 * if user clicks on the create_pos_session_id, the startPosSession mutation should be called.
 * it should return with a pos_session_id that should be saved to loalstorage by use dispatch.
 * Then we should show the user a success message and redirect to the /pos.
 *
 * if an error is thrown in mutation  then it means we should display the error and stick there.
 *
 *
 */

// // export default PosSession;
// import { all_routes } from '../../routes/all_routes';
// import { Link } from 'react-router-dom';
// // import { underMaintenance } from '../../utils/imagepath';
// import { useCheckPosSessionQuery, useStartPosSessionMutation } from '@core/redux/api/inventory-api';
// import { setPosSessionId } from '@core/redux/pos-session';
// import { useAppDispatch, useAppSelector } from '@core/redux/store';
// import { useEffect } from 'react';

// const PosSession = () => {
//   const { data, isLoading, isFetching, error } = useCheckPosSessionQuery();
//   const [startPosSession, { isLoading: loadCreatePos, isError: isCreatePosError, error: posError, success: posSuccess }] =
//     useStartPosSessionMutation();
//   const dispatch = useAppDispatch;
//   const selector = useAppSelector;

//   const token = selector((state) => state.PosSession.posSessionId);

//   if (!token) {
//     useCheckPosSessionQuery({});
//   }

//   useEffect(() => {
//     const token;
//   }, []);

//   const startPosSessionHandler = async () => {
//     const data = await startPosSession('');
//     console.log('data is ', data);
//   };

//   if (error) {
//     return (
//       <div className="page-wrapper pagehead">
//         <div className="content">
//           <div className="page-header">
//             <div className="page-title">
//               <h4>Error</h4>
//               <h6>Error: fetching sesssion</h6>
//               {/* <p>{error.data.message}</p> */}
//               {error.data.statusCode === 404 ? (
//                 <div className="card bg-white border-0">
//                   <div className="alert custom-alert1 alert-primary">
//                     <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close">
//                       <i className="fas fa-xmark" />
//                     </button>
//                     <div className="text-center  px-5 pb-0">
//                       <div className="custom-alert-icon">
//                         <i className="feather-info flex-shrink-0" />
//                       </div>
//                       <h5>No session found</h5>
//                       <p className="">{error.data.message}</p>
//                       <div className="">
//                         <button className="btn btn-sm btn-outline-danger m-1">Decline</button>
//                         {loadCreatePos ? (
//                           <button className="btn btn-dark text-fixed-white" type="button" disabled>
//                             <span className="spinner-grow spinner-grow-sm align-middle me-1" role="status" aria-hidden="true" />
//                             Loading...
//                           </button>
//                         ) : (
//                           <button className="btn btn-sm btn-primary m-1" onClick={startPosSessionHandler}>
//                             start session{' '}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="card bg-white border-0">
//                   <div className="alert custom-alert1 alert-primary">
//                     <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close">
//                       <i className="fas fa-xmark" />
//                     </button>
//                     <div className="text-center  px-5 pb-0">
//                       <div className="custom-alert-icon">
//                         <i className="feather-info flex-shrink-0" />
//                       </div>
//                       <h5>Information?</h5>
//                       <p className="">{error.data.message}</p>
//                       {/* <div className="">
//                         <button className="btn btn-sm btn-outline-danger m-1">Decline</button>
//                         <button className="btn btn-sm btn-primary m-1">start session </button>
//                       </div> */}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // if data has posSessionId, display  set it on local storage and then refresh the page

//   // if no possessionid returned , force the user to start a new session.
//   // once the session is started, it will be stored in local storage and the page will refresh to show the active session.
//   if (!data) {
//     return (
//       <div>
//         <h2>No active POS session</h2>
//         <p>You must start a POS session before continuing.</p>
//         <Link to={all_routes.possession} className="btn btn-primary">
//           Start Session
//         </Link>
//       </div>
//     );
//   }

//   console.log('data is ', data);
//   // if data has posSessionId, display it
//   // and set it on local storage and then refresh the page
//   if (data?.posSessionId && !localStorage.getItem('pos_session_id')) {
//     // localStorage.setItem('pos_session_id', JSON.stringify({ pos_session_id: data.posSessionId }));
//     setPosSessionId;
//     //redirect to pos session page
//     // window.location.reload();
//   }

//   const route = all_routes;
//   return (
//     <>
//       {isLoading || isFetching ? (
//         <div className="main-wrapper">
//           <div className="error-box">
//             <div className="error-img">{/* <img src={underMaintenance} className="img-fluid" alt="Img" /> */}</div>
//             <h3 className="h2 mb-3">We are Under Maintenance</h3>
//             <p>Sorry for any inconvenience caused, we have almost done Will get back soon!</p>
//             <Link to={route.dashboard} className="btn btn-primary">
//               Loading ....
//             </Link>
//           </div>
//         </div>
//       ) : (
//         <div className="card bg-white border-0">
//           <div className="alert custom-alert1 alert-secondary">
//             {/* <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close">
//             <i className="fas fa-xmark" />
//           </button> */}
//             <div className="text-center px-5 pb-0">
//               <div className="custom-alert-icon">
//                 <i className="feather-check-circle flex-shrink-0" />
//               </div>
//               <h5>Session Confirmed</h5>
//               <p className="">confirmed. Session created.</p>
//               <div className="">
//                 <button className="btn btn-sm btn-secondary m-1">Close</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Main Wrapper */}

//       {/* /Main Wrapper */}
//     </>
//   );
// };

// export default PosSession;
