import  { useState } from "react";
import SearchFromApi from "../../components/data-table/search";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import { Link } from "react-router";

const PagesList = () => {
  const [rows, setRows] = useState<number>(10);
  const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Pages</h4>
                <h6>Manage your pages</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-testimonial"
              >
                <i className="feather icon-plus-circle me-1" />
                Add Page
              </Link>
            </div>
          </div>
          {/* product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Inactive
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        New Joiners
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Desending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body pb-0">
              <div className="custom-datatable-filter   table-responsive">
                <table className="table datatable">
                  <thead className="thead-light">
                    <tr>
                      <th className="no-sort">
                        <label className="checkboxs">
                          <input type="checkbox" id="select-all" />
                          <span className="checkmarks" />
                        </label>
                      </th>
                      <th>Page</th>
                      <th>Page Slug</th>
                      <th>Last Edited</th>
                      <th>Status</th>
                      <th className="no-sort" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Products</h6>
                      </td>
                      <td>products</td>
                      <td>24 Dec 2024, 09:00AM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Expired Products</h6>
                      </td>
                      <td>expired products</td>
                      <td>10 Dec 2024, 11:20 AM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Low Stocks</h6>
                      </td>
                      <td>low stocks</td>
                      <td>27 Nov 2024, 08:30 AM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Catergory</h6>
                      </td>
                      <td>catergory</td>
                      <td>18 Nov 2024, 03:15 PM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Sub Category</h6>
                      </td>
                      <td>sub category</td>
                      <td>06 Nov 2024, 04:00 PM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Brands</h6>
                      </td>
                      <td>brands</td>
                      <td>25 Oct 2024, 06:20 PM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Units</h6>
                      </td>
                      <td>units</td>
                      <td>14 Oct 2024, 11:40 AM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Warranties</h6>
                      </td>
                      <td>warranties</td>
                      <td>03 Oct 2024, 12:10 PM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Coupons</h6>
                      </td>
                      <td>coupons</td>
                      <td>20 Sep 2024, 10:00 AM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks" />
                        </label>
                      </td>
                      <td>
                        <h6>Gift Card</h6>
                      </td>
                      <td>gift card</td>
                      <td>10 Sep 2024, 05:30 PM</td>
                      <td>
                        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                          <i className="ti ti-point-filled me-1" />
                          Active
                        </span>
                      </td>
                      <td className="action-table-data">
                        <div className="edit-delete-action">
                          <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-testimonial"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            data-bs-toggle="modal"
                            data-bs-target="#delete-modal"
                            className="p-2"
                            to="#"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="d-flex justify-content-between">
                  <div
                    className="dataTables_length"
                    id="DataTables_Table_0_length"
                  >
                    <label>
                      <select
                        name="DataTables_Table_0_length"
                        aria-controls="DataTables_Table_0"
                        className="form-select form-select-sm"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>{" "}
                      Entries
                    </label>
                  </div>
                  <div
                    className="dataTables_paginate paging_simple_numbers"
                    id="DataTables_Table_0_paginate"
                  >
                    <ul className="pagination">
                      <li
                        className="paginate_button page-item previous disabled"
                        id="DataTables_Table_0_previous"
                      >
                        <Link
                          to="#"
                          aria-controls="DataTables_Table_0"
                          aria-disabled="true"
                          role="link"
                          data-dt-idx="previous"
                          tabIndex={-1}
                          className="page-link"
                        >
                          <i className="fa fa-angle-left" />{" "}
                        </Link>
                      </li>
                      <li className="paginate_button page-item active">
                        <Link
                          to="#"
                          aria-controls="DataTables_Table_0"
                          role="link"
                          aria-current="page"
                          data-dt-idx={0}
                          tabIndex={0}
                          className="page-link"
                        >
                          1
                        </Link>
                      </li>
                      <li
                        className="paginate_button page-item next disabled"
                        id="DataTables_Table_0_next"
                      >
                        <Link
                          to="#"
                          aria-controls="DataTables_Table_0"
                          aria-disabled="true"
                          role="link"
                          data-dt-idx="next"
                          tabIndex={-1}
                          className="page-link"
                        >
                          {" "}
                          <i className=" fa fa-angle-right" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014-2025 © DreamsPOS. All Right Reserved</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      <>
        {/* Add Testimonial */}
        <div className="modal fade" id="add-testimonial">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Add Page</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Slug <span className="text-danger">*</span>
                      </label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Keywords <span className="text-danger">*</span>
                      </label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        defaultValue={""}
                      />
                    </div>
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label">Status</span>
                      <input
                        type="checkbox"
                        id="users6"
                        className="check"
                        defaultChecked
                      />
                      <label htmlFor="users6" className="checktoggle mb-0" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  >
                    Add Page
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Testimonial */}
        {/* Edit Testimonial */}
        <div className="modal fade" id="edit-testimonial">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Edit Page</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        defaultValue="Products"
                      />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        defaultValue="products"
                      />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Keywords <span className="text-danger">*</span>
                      </label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="col-lg-12 mb-3">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        defaultValue={""}
                      />
                    </div>
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label">Status</span>
                      <input
                        type="checkbox"
                        id="users7"
                        className="check"
                        defaultChecked
                      />
                      <label htmlFor="users7" className="checktoggle mb-0" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit Testimonial */}
        {/* delete modal */}
        <DeleteModal />
        {/* /delete modal */}
      </>
    </>
  );
};

export default PagesList;
