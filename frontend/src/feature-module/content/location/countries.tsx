import { useState } from 'react';
import { Link } from 'react-router-dom';
import PrimeDataTable from '../../../components/data-table';
import TableTopHead from '../../../components/table-top-head';
import DeleteModal from '../../../components/delete-modal';
import SearchFromApi from '../../../components/data-table/search';
const Countries = () => {
  const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<number>(10);

  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };
  const data = [
    {
      CountryName: 'United States',
      CountryCode: 'US'
    },
    {
      CountryName: 'Canada',
      CountryCode: 'CA'
    },
    {
      CountryName: 'United Kingdom',
      CountryCode: 'UK'
    },
    {
      CountryName: 'Germany',
      CountryCode: 'DE'
    },
    {
      CountryName: 'France',
      CountryCode: 'FR'
    },
    {
      CountryName: 'Argentina',
      CountryCode: 'AR'
    },
    {
      CountryName: 'India',
      CountryCode: 'IN'
    },
    {
      CountryName: 'Italy',
      CountryCode: 'IT'
    },
    {
      CountryName: 'New Zealand',
      CountryCode: 'NZ'
    },
    {
      CountryName: 'Australia',
      CountryCode: 'AU'
    }
  ];
  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => {
        return (
          <label className="checkboxs">
            <input type="checkbox" />
            <span className="checkmarks" />
          </label>
        );
      },
      sortable: false
    },
    {
      header: 'CountryName',
      field: 'CountryName'
    },
    {
      header: 'CountryCode',
      field: 'CountryCode'
    },

    {
      header: 'Status',
      field: 'Status',
      body: () => (
        <>
          <span className={` badge badge-success d-inline-flex align-items-center badge-xs`}>
            <i className="ti ti-point-filled me-1" />
            Active
          </span>
        </>
      )
    },

    {
      header: '',
      field: 'action',
      className: 'action-table-data',
      body: () => (
        <div className="edit-delete-action">
          <Link className="me-2 p-2" data-bs-toggle="modal" data-bs-target="#edit-country" to="#">
            <i className="ti ti-edit" />
          </Link>
          <Link data-bs-toggle="modal" data-bs-target="#delete-modal" className="p-2" to="#">
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
      sortable: false
    }
  ];
  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Countries</h4>
                <h6>Manage Your Countries</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-country">
                <i className="feather icon-plus-circle me-1" />
                Add Country
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Status
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
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
            <div className="card-body p-0">
              <div className=" table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={data}
                  totalRecords={10}
                  rows={10}
                  setRows={() => {}}
                  currentPage={1}
                  setCurrentPage={() => {}}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014-2025 © DreamsPOS. All Right Reserved</p>
          <p>
            Designed &amp; Developed By{' '}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* Add Country */}
      <div className="modal fade" id="add-country">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Country</h4>
              </div>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="mb-3">
                    <label className="form-label">
                      Country Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Country Code <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span className="status-label">Status</span>
                    <input type="checkbox" id="users6" className="check" defaultChecked />
                    <label htmlFor="users6" className="checktoggle mb-0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="modal" className="btn btn-primary fs-13 fw-medium p-2 px-3">
                  Add Country
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Country */}
      {/* Edit Country */}
      <div className="modal fade" id="edit-country">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Edit Country</h4>
              </div>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="mb-3">
                    <label className="form-label">
                      Country Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" defaultValue="United States" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Country Code <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" defaultValue="US" />
                  </div>
                  <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span className="status-label">Status</span>
                    <input type="checkbox" id="users5" className="check" defaultChecked />
                    <label htmlFor="users5" className="checktoggle mb-0" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="modal" className="btn btn-primary fs-13 fw-medium p-2 px-3">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Country */}
      {/* Delete Modal */}
      <DeleteModal />
      {/* /Delete Modal */}
    </>
  );
};

export default Countries;
