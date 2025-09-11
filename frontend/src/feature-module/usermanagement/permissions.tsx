import { type FC, useState } from "react";
import { Link } from "react-router-dom";
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import PrimeDataTable from "../../components/data-table";
import { permissionsData } from "../../core/json/permission-data";

const Permissions: FC = () => {
  const [listData, _setListData] = useState<any[]>(permissionsData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, _setTotalRecords] = useState<any>(5);
  const [rows, setRows] = useState<number>(10);
  const [_searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };
  const columns = [
    {
      header: "Modules",
      field: "module",
      key: "module",
      body: (row: any) => <span className="text-gray-9">{row.module}</span>,
    },
    {
      header: "Allow All",
      field: "allowAll",
      key: "allowAll",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.allowAll}
            onChange={(e) =>
              onChange && onChange(idx, "allowAll", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Read",
      field: "read",
      key: "read",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.read}
            onChange={(e) =>
              onChange && onChange(idx, "read", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Write",
      field: "write",
      key: "write",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.write}
            onChange={(e) =>
              onChange && onChange(idx, "write", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Create",
      field: "create",
      key: "create",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.create}
            onChange={(e) =>
              onChange && onChange(idx, "create", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Delete",
      field: "delete",
      key: "delete",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.delete}
            onChange={(e) =>
              onChange && onChange(idx, "delete", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Import",
      field: "import",
      key: "import",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.import}
            onChange={(e) =>
              onChange && onChange(idx, "import", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Export",
      field: "export",
      key: "export",
      body: (row: any, idx: number, onChange?: any) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.export}
            onChange={(e) =>
              onChange && onChange(idx, "export", e.target.checked)
            }
          />
        </div>
      ),
    },
  ];
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Permission</h4>
              <h6>Manage your permissions</h6>
            </div>
          </div>
          <TableTopHead />
        </div>
        {/* /product list */}
        <div className="card">
          <div className="card-header">
            <div className="table-top mb-0">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex align-items-center">
                <p className="mb-0 fw-medium text-gray-9 me-1">Role:</p>
                <p>Admin</p>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
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
        {/* /product list */}
      </div>
      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2014 - 2025 © DreamsPOS. All Right Reserved</p>
        <p>
          Designed &amp; Developed by{" "}
          <Link to="#" className="text-primary">
            Dreams
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Permissions;
