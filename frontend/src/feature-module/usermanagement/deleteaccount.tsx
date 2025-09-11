import { useState } from 'react';
import { Link } from 'react-router-dom';
import TableTopHead from '../../components/table-top-head';
import SearchFromApi from '../../components/data-table/search';
import PrimeDataTable from '../../components/data-table';
import { deleteAccountData } from '../../core/json/delete-account-list-data';
import DeleteModal from '../../components/delete-modal';

const DeleteAccount = () => {
  const [listData, _setListData] = useState<any[]>(deleteAccountData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, _setTotalRecords] = useState<any>(5);
  const [rows, setRows] = useState<number>(10);
  const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: 'select'
    },
    {
      header: 'User Name',
      field: 'username',
      key: 'username',
      body: (row: any) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <img src={row.img} alt="user" />
          </Link>
          <div>
            <Link to="#">{row.username}</Link>
          </div>
        </div>
      )
    },
    {
      header: 'Requisition Date',
      field: 'requisitionDate',
      key: 'requisitionDate'
    },
    {
      header: 'Delete Request Date',
      field: 'deleteRequestDate',
      key: 'deleteRequestDate'
    },
    {
      header: '',
      field: 'actions',
      key: 'actions',
      sortable: false,
      body: (_row: any) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link className="p-2 d-flex align-items-center p-1 border rounded" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal">
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      )
    }
  ];
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
                <h4>Delete Account Request</h4>
              </div>
            </div>
            <TableTopHead />
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3"></div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={listData}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>
      <DeleteModal />
    </div>
  );
};

export default DeleteAccount;
