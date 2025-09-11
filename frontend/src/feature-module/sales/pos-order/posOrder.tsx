import PrimeDataTable from '../../../components/data-table';
import { onlineOrderData } from '../../../core/json/onlineOrderData';
import { Link } from 'react-router-dom';
import OnlineorderModal from '../online-order/onlineorderModal';
import CommonFooter from '../../../components/footer/commonFooter';
import TableTopHead from '../../../components/table-top-head';
import DeleteModal from '../../../components/delete-modal';
import SearchFromApi from '../../../components/data-table/search';
import { useState } from 'react';

const PosOrder = () => {
  const dataSource = onlineOrderData;

  const columns = [
    {
      header: 'Customer Name',
      field: 'customer',
      body: (text: any) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <img src={text.image} alt="product" />
          </Link>
          <Link to="#">{text?.customer}</Link>
        </div>
      )
    },
    {
      header: 'Reference',
      field: 'reference'
    },
    {
      header: 'Date',
      field: 'date'
    },

    {
      header: 'Status',
      field: 'status',
      body: (text: any) => (
        <span className={`badge ${text?.status === 'Pending' ? 'badge-cyan' : text?.status === 'Completed' ? 'badge-success' : ''} `}>
          {text?.status}
        </span>
      )
    },
    {
      header: 'Grand Total',
      field: 'total'
    },
    {
      header: 'Paid',
      field: 'paid'
    },
    {
      header: 'Due',
      field: 'due'
    },
    {
      header: 'Payment Status',
      field: 'paymentstatus',
      body: (text: any) => (
        <span
          className={`badge badge-xs shadow-none ${text?.paymentstatus === 'Unpaid' ? 'badge-soft-danger' : text?.paymentstatus === 'Paid' ? 'badge-soft-success' : 'badge-soft-warning'} `}
        >
          <i className="ti ti-point-filled me-1"></i>
          {text?.paymentstatus}
        </span>
      )
    },
    {
      header: 'Biller',
      field: 'biller'
    },

    {
      header: '',
      field: 'action',
      body: () => (
        <>
          <Link className="action-set" to="#" data-bs-toggle="dropdown" aria-expanded="true">
            <i className="fa fa-ellipsis-v" aria-hidden="true" />
          </Link>
          <ul className="dropdown-menu">
            <li>
              <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#sales-details-new">
                <i className="feather icon-eye info-img" />
                Sale Detail
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#edit-sales-new">
                <i className="feather icon-edit info-img" />
                Edit Sale
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#showpayment">
                <i className="feather icon-dollar-sign info-img" />
                Show Payments
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#createpayment">
                <i className="feather icon-plus-circle info-img" />
                Create Payment
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item">
                <i className="feather icon-download info-img" />
                Download pdf
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item mb-0" data-bs-toggle="modal" data-bs-target="#delete-modal">
                <i className="feather icon-trash-2 info-img" />
                Delete Sale
              </Link>
            </li>
          </ul>
        </>
      )
    }
  ];

  const [rows, setRows] = useState<number>(10);
  const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>POS Orders</h4>
                <h6>Manage Your pos orders</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-sales-new">
                <i className="ti ti-circle-plus me-1"></i> Add Sales
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card manage-stock">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Customer
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Carl Evans
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Minerva Rameriz
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Robert Lamon
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Patricia Lewis
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Staus
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Completed
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Pending
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Payment Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Paid
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Unpaid
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Overdue
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
            <div className="card-body">
              <div className="custom-datatable-filter table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={dataSource}
                  rows={10}
                  setRows={() => {}}
                  currentPage={1}
                  setCurrentPage={() => {}}
                  totalRecords={10}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <CommonFooter />
      </div>
      <OnlineorderModal />
      <DeleteModal />
    </div>
  );
};

export default PosOrder;
