import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import type { Supplier } from '../interface/features-interface';

//import { Typography } from '@material-tailwind/react';

// Define the type for the product data
// interface Product {
//   name: string;
//   quantity: string;
//   price: string;
// }

interface SupplierTableProps {
  data: Supplier[];
}

const SupplierProductsTable: React.FC<SupplierTableProps> = ({ data }) => {
  const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: 'name', // Normal accessorKey
        header: 'SupplierName',
        size: 150
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 100
      },
      {
        accessorKey: 'contact',
        header: 'contact',
        size: 100
      }
    ],
    []
  );

  //   const table = useMaterialReactTable({
  //     columns,
  //     data, // Use the data passed from the parent (SupplierProducts)
  //   });
  const table = useMaterialReactTable({
    columns,
    data,
    enableExpandAll: false, //disable expand all button
    muiDetailPanelProps: () => ({
      sx: (theme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,210,244,0.1)' : 'rgba(0,0,0,0.1)'
      })
    }),
    //custom expand button rotation
    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s'
      }
    }),
    //conditionally render detail panel
    renderDetailPanel: ({ row }) =>
      row.original.supplier_id ? (
        <div
          style={{
            display: 'grid',
            margin: 'auto',
            gridTemplateColumns: '1fr 1fr',
            width: '100%'
          }}
        >
          {row.original.SupplierProducts?.map((product) => (
            <div key={product.product_id}> {product.product?.name} </div>
          ))}
        </div>
      ) : null
  });

  return <MaterialReactTable table={table} />;
};

export default SupplierProductsTable;
