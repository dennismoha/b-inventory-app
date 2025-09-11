import { Paginator } from 'primereact/paginator';
import React from 'react';

interface CustomPaginatorProps {
  currentPage: number;
  totalPages: number;
  rows: number;
  totalRecords: number;
  onPageChange: (newPage: number) => void;
  setRows: any;
}

const CustomPaginator: React.FC<CustomPaginatorProps> = ({ currentPage, totalPages, rows, totalRecords, onPageChange, setRows }) => {
  const handlePaginatorChange = (event: any) => {
    onPageChange(event.page + 1);
  };

  currentPage > 1 ? (currentPage - 1) * rows + 1 : currentPage;

  const handleSelectChange = (value: any) => {
    setRows(value);
  };
  return (
    <>
      {totalPages ? (
        <>
          <div className="parent-class-datatable">
            <div className="dataTables_length" id="DataTables_Table_0_length">
              <label>
                Row Per Page{' '}
                <select
                  name="DataTables_Table_0_length"
                  aria-controls="DataTables_Table_0"
                  className="form-select form-select-sm"
                  onChange={(e) => handleSelectChange(e.target.value)}
                >
                  <option value={5}>5</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>{' '}
                Entries
              </label>
            </div>
            <div className="dataTables_paginate paging_simple_numbers" id="DataTables_Table_0_paginate">
              <Paginator first={(currentPage - 1) * rows} rows={rows} totalRecords={totalRecords} onPageChange={handlePaginatorChange} />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default CustomPaginator;
