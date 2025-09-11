import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CustomPaginator from './custom-paginator';
import { Skeleton } from 'primereact/skeleton';
// import { noRecord } from "../../utils/imagepath";

interface Props {
  column: any;
  data: any;
  totalRecords: number;
  rowClassName?: string;
  currentPage: number;
  setCurrentPage: any;
  rows?: number;
  setRows?: any;
  onRowDoubleClick?: Function;
  onRowClickSetState?: boolean;
  type?: string;
  onClickNavigate?: Function;
  sortable?: boolean;
  footer?: any;
  setSearchQuery?: any;
  isPaginationEnabled?: boolean;
  loading?: boolean;
}

const PrimeDataTable: React.FC<Props> = ({
  column,
  data = [],
  totalRecords,
  currentPage = 1,
  setCurrentPage,
  rows = 10,
  setRows,
  sortable = true,
  footer = null,
  loading = false,

  isPaginationEnabled = true
}) => {
  const skeletonRows = Array(rows).fill({});
  const totalPages = Math.ceil(totalRecords / rows);

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const customEmptyMessage = () => (
    <div className="no-record-found">
      {/* <img src={noRecord} alt="no-record"></img> */}
      <h4>No records found.</h4>
      <p>No records to show here...</p>
    </div>
  );
  return (
    <>
      <DataTable
        value={loading ? skeletonRows : data}
        className="table custom-table datatable"
        totalRecords={totalRecords}
        // paginator
        rows={10}
        tableStyle={{ minWidth: '50rem' }}
        rowsPerPageOptions={[5, 10]}
        emptyMessage={customEmptyMessage}
        footer={footer}
      >
        {column?.map((col: any, index: number) => (
          <Column
            header={col.header}
            key={col.field || index}
            field={col.field}
            body={(rowData: any, options: any) => {
              return loading ? (
                <Skeleton width="100%" height="2rem" className="skeleton-glow" />
              ) : col.body ? (
                col.body(rowData, options)
              ) : (
                rowData[col.field]
              );
            }}
            sortable={sortable === false ? false : col.sortable !== false}
            sortField={col.sortField ? col.sortField : col.field}
            className={col.className ? col.className : ''}
          />
        ))}
      </DataTable>
      {isPaginationEnabled && (
        <CustomPaginator
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          rows={rows}
          setRows={setRows}
        />
      )}
    </>
  );
};

export default PrimeDataTable;
