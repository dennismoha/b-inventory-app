import React, { useState, useEffect } from 'react';
import { useCreateCustomerMutation } from '@core/redux/api/inventory-api';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal } from 'bootstrap';

const CustomerModal: React.FC = () => {
  const [createCustomer, { isLoading, isSuccess, isError, error, reset }] = useCreateCustomerMutation();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields validation
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      alert('Please fill in all required fields (First Name, Last Name, Phone).');
      return;
    }

    if (isNaN(Number(phoneNumber))) {
      alert('Phone number must be numeric.');
      return;
    }

    try {
      await createCustomer({
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        country,
        notes,
        preferredPaymentMethod
      }).unwrap();
    } catch {
      // handled by RTK mutation state
    }
  };

  // Auto-close modal on success
  useEffect(() => {
    if (isSuccess) {
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setAddress('');
      setCountry('');
      setNotes('');
      setPreferredPaymentMethod('');

      reset();
      const el = document.getElementById('create');
      if (el) {
        const modal = Modal.getInstance(el);
        if (modal) {
          modal.hide();
          el.classList.remove('show');
          el.style.display = 'none';
          document.body.classList.remove('modal-open');
          document.querySelector('.modal-backdrop')?.remove();
        } else {
          // fallback: if somehow no instance, forcibly clean up
          el.classList.remove('show');
          el.style.display = 'none';
          document.body.classList.remove('modal-open');
          document.querySelector('.modal-backdrop')?.remove();
        }
      }
    }
  }, [isSuccess]);

  return (
    <div className="modal fade" id="create" tabIndex={-1} aria-labelledby="create" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Customer</h5>
            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body pb-1">
              {isError && <div className="alert alert-danger">{error.message || 'Failed to create customer.'}</div>}

              <div className="row">
                {/* First Name */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                </div>

                {/* Last Name */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>

                {/* Email */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {/* Address */}
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                {/* Country */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>

                {/* Preferred Payment Method */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Preferred Payment Method</label>
                    <input
                      type="text"
                      className="form-control"
                      value={preferredPaymentMethod}
                      onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button type="button" className="btn btn-md btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-md btn-primary" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>

              {isSuccess && <div className="text-success">Customer created successfully!</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;

// import { useCreateCustomerMutation } from '@core/redux/api/inventory-api';
// import React from 'react';

// const CustomerModal = () => {
//   const [createCustomer] = useCreateCustomerMutation();
//   return (
//     <div className="modal fade" id="create" tabIndex={-1} aria-labelledby="create" aria-hidden="true">
//       <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Create</h5>
//             <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
//               <span aria-hidden="true">×</span>
//             </button>
//           </div>
//           <form>
//             <div className="modal-body pb-1">
//               <div className="row">
//                 <div className="col-lg-6 col-sm-12 col-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Customer Name <span className="text-danger">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//                 <div className="col-lg-6 col-sm-12 col-12">
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Phone <span className="text-danger">*</span>
//                     </label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//                 <div className="col-lg-12">
//                   <div className="mb-3">
//                     <label className="form-label">Email</label>
//                     <input type="email" className="form-control" />
//                   </div>
//                 </div>
//                 <div className="col-lg-12">
//                   <div className="mb-3">
//                     <label className="form-label">Address</label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//                 <div className="col-lg-6 col-sm-12 col-12">
//                   <div className="mb-3">
//                     <label className="form-label">City</label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//                 <div className="col-lg-6 col-sm-12 col-12">
//                   <div className="mb-3">
//                     <label className="form-label">Country</label>
//                     <input type="text" className="form-control" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
//               <button type="button" className="btn btn-md btn-secondary" data-bs-dismiss="modal">
//                 Cancel
//               </button>
//               <button type="button" data-bs-dismiss="modal" className="btn btn-md btn-primary">
//                 Submit
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerModal;
