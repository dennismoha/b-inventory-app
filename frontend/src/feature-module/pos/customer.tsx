import React, { type ChangeEvent, useCallback } from 'react';
import { useGetCustomersQuery } from '@core/redux/api/inventory-api';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { changeCustomerId } from '@core/redux/cart';
import { Link } from 'react-router';

// type CustomersProp = {
//   showAlert?: true | false;
//   setShowAlert?: any;
// };

// const Customers: React.FC<CustomersProp> = ({ showAlert=true, setShowAlert }) => {
const Customers: React.FC = () => {
  const selectedCustomer = useAppSelector((state) => state.cart.customerId);
  console.log('selected option is ', selectedCustomer);
  const dispatch = useAppDispatch();
  const { isLoading, isError, error, data } = useGetCustomersQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });
  console.log('data for customers is ', data);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      dispatch(changeCustomerId({ customerId: event.target.value }));
    },
    [dispatch] // Dependencies: only re-create if 'dispatch' changes
  );

  return (
    <div className="customer-info block-section">
      <h5 className="mb-2">Customer Information</h5>
      <p>{isError ? error.message : null} </p>
      <div className="d-flex align-items-center gap-2">
        {/* <div className="flex-grow-1">
          <Select options={options} classNamePrefix="react-select select" placeholder="Choose a Name" defaultValue={options[0]} />
        </div> */}
        {/* <div className="col-md-6"> */}

        <select
          name="customerId"
          value={selectedCustomer}
          onChange={handleChange}
          className="form-select"
          aria-label="Default select example"
        >
          {isLoading ? (
            'loading'
          ) : (
            <>
              <option value="">Open this select menu</option>
              {data?.data.map((data) => (
                <option key={data.customerId} value={data.customerId}>
                  {data.firstName} {data.lastName} - {data.phoneNumber}
                </option>
              ))}
            </>
          )}

          {/* <option value={1}>One</option>
          <option value={2}>Two</option>
          <option value={3}>Three</option> */}
        </select>
        {/* </div> */}

        <Link to="#" className="btn btn-teal btn-icon fs-20" data-bs-toggle="modal" data-bs-target="#create">
          <i className="ti ti-user-plus" />
        </Link>
        {/* <Link to="#" className="btn btn-info btn-icon fs-20" data-bs-toggle="modal" data-bs-target="#barcode">
          <i className="ti ti-scan" />
        </Link> */}
      </div>
      {/* {showAlert && (
        <div className="customer-item border border-orange bg-orange-100 d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
          <div>
            <h6 className="fs-16 fw-bold mb-1">James Anderson</h6>
            <div className="d-inline-flex align-items-center gap-2 customer-bonus">
              <p className="fs-13 d-inline-flex align-items-center gap-1">
                Bonus :<span className="badge bg-cyan fs-13 fw-bold p-1">148</span>
              </p>
              <p className="fs-13 d-inline-flex align-items-center gap-1">
                Loyality :<span className="badge bg-teal fs-13 fw-bold p-1">$20</span>
              </p>
            </div>
          </div>
          <Link to="#" className="btn btn-orange btn-sm">
            Apply
          </Link>
          <Link to="#" className="close-icon" onClick={() => setShowAlert(false)}>
            <i className="ti ti-x" />
          </Link>
        </div>
      )} */}
    </div>
  );
};

export default Customers;
