import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommonFooter from '@components/footer/commonFooter';
import RefreshIcon from '@components/tooltip-content/refresh';
import CollapesIcon from '@components/tooltip-content/collapes';
import TooltipIcons from '@components/tooltip-content/tooltipIcons';
import PrimeDataTable from '@components/data-table';
import CommonDateRangePicker from '@components/date-range-picker/common-date-range-picker';
import { useGetPurchaseBatchPayablesQuery } from '@core/redux/api/inventory-api';

const PurchasePayablesReport = () => {
  const { data: getPurchaseBatchPayable } = useGetPurchaseBatchPayablesQuery();

  const purchaseData = getPurchaseBatchPayable?.data ?? [];
  console.log('purchase data is ', purchaseData);
  const [listData, setListData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [rows, setRows] = useState<number>(10);

  useEffect(() => {
    if (purchaseData) {
      setListData(purchaseData);
      setTotalRecords(purchaseData.length);
    }
  }, [purchaseData]);

  const columns = [
    {
      header: 'Batch',
      field: 'batch',
      sorter: (a: any, b: any) => a.batch.localeCompare(b.batch)
    },
    {
      header: 'Supplier',
      field: 'supplier_name',
      sorter: (a: any, b: any) => a.supplier_name.localeCompare(b.supplier_name)
    },
    {
      header: 'Product',
      field: 'product_name',
      sorter: (a: any, b: any) => a.product_name.localeCompare(b.product_name)
    },
    {
      header: 'Amount Due',
      field: 'amount_due',
      sorter: (a: any, b: any) => Number(a.amount_due) - Number(b.amount_due)
    },
    {
      header: 'Total Paid',
      field: 'total_paid',
      sorter: (a: any, b: any) => Number(a.total_paid) - Number(b.total_paid)
    },
    {
      header: 'Balance Due',
      field: 'balance_due',
      sorter: (a: any, b: any) => Number(a.balance_due) - Number(b.balance_due)
    },
    {
      header: 'Payment Type',
      field: 'payment_type',
      sorter: (a: any, b: any) => a.payment_type.localeCompare(b.payment_type)
    },
    {
      header: 'Settlement Date',
      field: 'settlement_date',
      body: (row: any) => (row.settlement_date ? new Date(row.settlement_date).toLocaleDateString() : 'Pending'),
      sorter: (a: any, b: any) => (a.settlement_date || '').localeCompare(b.settlement_date || '')
    }
    // {
    //   header: 'Payable ID',
    //   field: 'payable_id',
    // },
    // {
    //   header: 'Purchase ID',
    //   field: 'purchase_id',
    // },
  ];
  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Purchase Payables</h4>
              <h6>View Reports of Purchase Batches</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <RefreshIcon />
            <CollapesIcon />
          </ul>
        </div>

        {/* Filters */}
        <div className="card border-0">
          <div className="card-body pb-1">
            <form>
              <div className="row align-items-end">
                <div className="col-lg-10">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Choose Date</label>
                        <div className="input-icon-start position-relative">
                          <CommonDateRangePicker />
                          <span className="input-icon-left">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-2">
                  <div className="mb-3">
                    <button className="btn btn-primary w-100" type="submit">
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Data Table */}
        <div className="card table-list-card no-search">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <h4>Purchase Payables Report</h4>
            </div>
            <ul className="table-top-head">
              <TooltipIcons />
              <li>
                <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" title="Print">
                  <i className="ti ti-printer" />
                </Link>
              </li>
            </ul>
          </div>
          <div className="card-body">
            <div className="table-responsive custome-search">
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
      </div>
      <CommonFooter />
    </div>
  );
};

export default PurchasePayablesReport;
