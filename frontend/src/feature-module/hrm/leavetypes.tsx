import  { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import AddLeaveType from "../../core/modals/hrm/addleavetype";
import EditLeaveType from "../../core/modals/hrm/editleavetype";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";

const LeaveTypes = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, _setTotalRecords] = useState<any>(5);
  const [rows, setRows] = useState<number>(10);
  const dataSource = useSelector(
    (state: any) => state.rootReducer.leavetypes_data
  );

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
      key: "checked",
    },
    {
      field: "name",
      header: "Name",
      sortable: true,
      sortFunction: (a: any, b: any) => a.name.length - b.name.length,
    },
    {
      field: "leavequota",
      header: "Leave Quota",
      sortable: true,
      sortFunction: (a: any, b: any) =>
        a.leavequota.length - b.leavequota.length,
    },
    {
      field: "createdon",
      header: "Created On",
      sortable: true,
      sortFunction: (a: any, b: any) => a.createdon.length - b.createdon.length,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      sortFunction: (a: any, b: any) => a.status.length - b.status.length,
      body: (rowData: any) => (
        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1" />
          {rowData.status}
        </span>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (_row: any) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-customer"
          >
            <i  className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal" data-bs-target="#delete-modal"
          >
            <i  className="feather icon-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Leave Type</h4>
                <h6>Manage your Leaves</h6>
              </div>
            </div>
           <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-leave"
              >
                Add Leave Type
              </Link>
            </div>
          </div>

          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={dataSource}
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
        <CommonFooter />
      </div>
      <AddLeaveType />
      <EditLeaveType />
     <DeleteModal />
    </div>
  );
};

export default LeaveTypes;
