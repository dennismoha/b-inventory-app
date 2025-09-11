// src/features/stock/components/StockTable.tsx
// import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useFetchStockQuery, useUpdateStockLevelMutation } from '@core/redux/api/inventory-api';
import type { StockResponseItem } from '../interface/features-interface';
import { getDefaultMRTOptions } from '@components/material-react-data-table';

const defaultMRTOptions = getDefaultMRTOptions<StockResponseItem>();

export default function StockTable() {
  const { data, isLoading } = useFetchStockQuery();
  const [updateStockLevel] = useUpdateStockLevelMutation();

  const stockData = data?.data ?? [];

  const columns: MRT_ColumnDef<StockResponseItem>[] = [
    {
      accessorKey: 'supplier_products_id',
      header: 'Supplier Product ID',
      enableEditing: false
    },
    {
      accessorKey: 'product_name',
      header: 'Product',
      enableEditing: false
    },
    {
      accessorKey: 'supplier_name',
      header: 'Supplier',
      enableEditing: false
    },
    {
      accessorKey: 'total_received',
      header: 'Total Received',
      enableEditing: false
    },
    {
      accessorKey: 'total_sold',
      header: 'Total Sold',
      enableEditing: false
    },
    {
      accessorKey: 'current_in_stock',
      header: 'Current In Stock',
      enableEditing: false
    },
    {
      accessorKey: 'reorder_level',
      header: 'Reorder Level'
    },
    {
      accessorKey: 'remaining',
      header: 'Remaining',
      enableEditing: false
    },
    {
      accessorKey: 'unit_quantity',
      header: 'Unit Quantity',
      enableEditing: false
    },
    {
      accessorKey: 'units',
      header: 'Units',
      enableEditing: false
    },
    {
      accessorKey: 'pricing_per_unit',
      header: 'Price per Unit',
      enableEditing: false
    },
    {
      accessorKey: 'effectiveData',
      header: 'Effective Date',
      enableEditing: false,
      Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
    },
    {
      accessorKey: 'total_cost_value_as_per_suppliers',
      header: 'Total Cost (Supplier Price)',
      enableEditing: false
    },
    {
      accessorKey: 'total_cost_value_in_our_stock_price',
      header: 'Total Cost (Our Stock Price)',
      enableEditing: false
    }
  ];

  const table = useMaterialReactTable({
    ...defaultMRTOptions,
    columns,
    data: stockData,
    enableEditing: true,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    getRowId: (row) => row.supplier_products_id, // unique id
    onEditingRowSave: async ({ values, row, table }) => {
      try {
        await updateStockLevel({
          supplier_products_id: row.original.supplier_products_id,
          reorder_level: Number(values.reorder_level)
        }).unwrap();

        table.setEditingRow(null); // close modal after save
      } catch (error) {
        console.error('Failed to update reorder level', error);
      }
    },
    state: {
      isLoading
    },
    initialState: {
      ...defaultMRTOptions.initialState,
      showColumnFilters: false
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
