import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { clearPosSessionId } from '@core/redux/pos-session';
import { useClosePosSessionMutation } from '@core/redux/api/inventory-api';
import { all_routes as route } from '@routes/all_routes';

const EndSession: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const posSessionId = useAppSelector((state) => state.PosSession.posSessionId);
  const [closePosSession, { isLoading, isError, error, isSuccess }] = useClosePosSessionMutation();

  const hasNavigatedRef = useRef(false);

  const handleEndSession = useCallback(async () => {
    if (!posSessionId || isLoading) return; // guard double-clicks and no-session
    try {
      await closePosSession({}).unwrap();
      dispatch(clearPosSessionId());
    } catch (err) {
      console.log('err clearing pos session ', err);
      // Error is already surfaced via isError/error
    }
  }, [posSessionId, isLoading, closePosSession, dispatch]);

  // Redirect after successful close
  useEffect(() => {
    if (isSuccess && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      navigate(route.pos, { replace: true });
    }
  }, [isSuccess, navigate]);

  if (isError) {
    return <div className="alert alert-danger">{(error as any)?.data?.message || 'Failed to end session.'}</div>;
  }

  if (isSuccess) {
    return <div className="alert alert-success">Session ended successfully. Redirecting…</div>;
  }

  if (!posSessionId) {
    return <div className="alert alert-info">No active POS session to end.</div>;
  }

  // Default (active session) UI
  return (
    <button onClick={handleEndSession} className="btn btn-purple btn-md d-inline-flex align-items-center" disabled={isLoading}>
      {isLoading ? (
        <>Ending session…</>
      ) : (
        <>
          <i className="ti ti-world me-1" />
          End Session
        </>
      )}
    </button>
  );
};

export default React.memo(EndSession);

/**
 *
 * Now here is the button to remove the session from localstorage.
 *
 * Now with this component  to things happen,. if a token is found in our state we show the end session button. otherwise we disable the buttton
 *  and show the no session button or whatever fits.
 *
 * now, we should use the useSelector hook to make sure a token exists either in our state.
 *
 * if no token exists then we display the 'end session button'. on clicking on that button the following should happen:
 * *
 * we need to send a request to our backend using the closePosSession hook.
 * if successful return then  we need to clear the token in our state using the  useDispatch hook to dispatch clearPosSessionId
 *    which clears the session.
 *
 * if successfu
 *
 * we need to remove the button from the state using useDispatch hook to dispatch clearPosSessionId or rather from state.
 *
 * after the token is removed succesfully we need to display a successfull session ended ui and redirect user to /pos.
 *
 * if no token upon visiting this page then we should show a 'no session' info which is tricky since we hae a  middleware to get against that but either way it should be done for whatever purposes
 *
 *
 */

// import { useClosePosSessionMutation } from '@core/redux/api/inventory-api';

// const EndSession = () => {
//   const [closePosSession, { isError, error, isLoading, isSuccess }] = useClosePosSessionMutation();

//   if (isError) {
//     console.log('is Error ', error);
//   }

//   const endSessionHandler = async () => {
//     closePosSession({});
//   };

//   if (isSuccess) {
//     localStorage.removeItem('pos_session_id');
//   }

//   return (
//     <div onClick={endSessionHandler} className="btn btn-purple btn-md d-inline-flex align-items-center">
//       {isLoading ? (
//         <div> loading ... </div>
//       ) : (
//         <>
//           <i className="ti ti-world me-1" />
//           end session
//         </>
//       )}
//     </div>
//   );
// };

// export default EndSession;
