import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import CommonSelect from '../../../components/select/common-select';
import { useCreateAccountMutation } from '@core/redux/api/inventory-api';
import { AccountType } from '../../interface/enums';

type AccountTypes = {
  label: string;
  value: AccountType;
};

const CreateAccountModal = () => {
  const [createAccount, { isError, error, isLoading, isSuccess }] = useCreateAccountMutation();

  // Local state for form inputs
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  //   const [selectedAccountStatus, setSelectedAccountStatus] = useState<AccountStatus | null>(null);

  // Options (match enum values exactly)
  const accountTypeOptions: AccountTypes[] = [
    { label: 'Cash', value: AccountType.CASH },
    { label: 'Bank', value: AccountType.BANK },
    { label: 'Credit Card', value: AccountType.CREDIT_CARD },
    { label: 'Other', value: AccountType.OTHER }
  ];

  //   const accountStatusOptions = [
  //     { label: 'Active', value: AccountStatus.ACTIVE },
  //     { label: 'Inactive', value: AccountStatus.INACTIVE },
  //     { label: 'Closed', value: AccountStatus.CLOSED }
  //   ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedAccountType || !openingBalance) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      name,
      account_number: accountNumber || null,
      type: selectedAccountType,
      description: description || null,
      balance: openingBalance
      //   current_balance: openingBalance,
      //   deleted: false,
      //   account_status: selectedAccountStatus
    };

    try {
      await createAccount(payload).unwrap();
      console.log('Account created successfully:', payload);

      // Reset form
      setName('');
      setAccountNumber('');
      setOpeningBalance('');
      setDescription('');
      setSelectedAccountType(null);
      //   setSelectedAccountStatus(null);
    } catch (err) {
      console.error('Failed to create account:', err);
    }
  };

  return (
    <div>
      <div className="modal fade" id="add-units">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Create Account</h4>
                  </div>
                  <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Account Holder Name */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Holder Name<span className="text-danger ms-1">*</span>
                          </label>
                          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">Account Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Account Type */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Type<span className="text-danger ms-1">*</span>
                          </label>
                          <CommonSelect
                            className="w-100"
                            options={accountTypeOptions}
                            value={selectedAccountType}
                            onChange={(e) => setSelectedAccountType(e.value)}
                            placeholder="Choose"
                            filter={false}
                          />
                        </div>
                      </div>

                      {/* Opening Balance */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Opening Balance<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                          <p className="fs-14 mt-1">Maximum 60 Words</p>
                        </div>
                      </div>

                      {/* Account Status */}
                      {/* <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Account Status<span className="text-danger ms-1">*</span>
                          </label>
                          <CommonSelect
                            className="w-100"
                            options={accountStatusOptions}
                            value={selectedAccountStatus}
                            onChange={(e) => setSelectedAccountStatus(e.value)}
                            placeholder="Choose"
                            filter={false}
                          />
                        </div>
                      </div> */}
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary fs-13 fw-medium p-2 px-3"
                        disabled={isLoading}
                        data-bs-dismiss={isSuccess ? 'modal' : ''}
                      >
                        {isLoading ? 'Adding...' : 'create Account'}
                      </button>
                    </div>

                    {isError && <div className="text-danger mt-2">Error: {JSON.stringify(error)}</div>}
                    {isSuccess && <div className="text-success mt-2">successfully added an account. you can close the modal</div>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import CommonSelect from '../../../components/select/common-select';
// import { useCreateAccountMutation } from '@core/redux/api/inventory-api';

// const CreateAccountModal = () => {
//   const [createAccont, { isError, error, isLoading }] = useCreateAccountMutation();

//   const AccountType = [
//     { label: 'Current Account', value: '1' },
//     { label: 'Salary Account', value: '2' }
//   ];
//   const AccountStatus = [
//     { label: 'Active', value: '1' },
//     { label: 'closed', value: '2' }
//   ];

//   const [selectedAccountStatus, setSelectedAccountStatus] = React.useState(null);
//   const [selectedAccountType, setSelectedAccountType] = React.useState(null);
//   return (
//     <div>
//       {/* Add ac*/}
//       <div className="modal fade" id="add-units">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Create Account</h4>
//                   </div>
//                   <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <form>
//                     <div className="row">
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Account Holder Name
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Account Number
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Account Type
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <CommonSelect
//                             className="w-100"
//                             options={AccountType}
//                             value={selectedAccountType}
//                             onChange={(e) => setSelectedAccountType(e.value)}
//                             placeholder="Choose"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Opening Balance
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <input type="text" className="form-control" defaultValue="$200" />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">Description</label>
//                           <textarea className="form-control" defaultValue={''} />
//                           <p className="fs-14 mt-1">Maximum 60 Words</p>
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="mb-3">
//                           <label className="form-label">
//                             Account Status
//                             <span className="text-danger ms-1">*</span>
//                           </label>
//                           <CommonSelect
//                             className="w-100"
//                             options={AccountStatus}
//                             value={selectedAccountStatus}
//                             onChange={(e) => setSelectedAccountStatus(e.value)}
//                             placeholder="Choose"
//                             filter={false}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//                 <div className="modal-footer">
//                   <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
//                     Cancel
//                   </button>
//                   <Link to="#" className="btn btn-primary fs-13 fw-medium p-2 px-3" data-bs-dismiss="modal">
//                     Add Account
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAccountModal;
