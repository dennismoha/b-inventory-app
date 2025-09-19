import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  type MRT_ColumnDef,
  // type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle
  // IconButton, Tooltip
} from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation
} from '@core/redux/api/inventory-api';
import type { Employee } from '../interface/features-interface';
import { Link } from 'react-router';

export default function EmployeesTable() {
  const { data, isLoading, isFetching, isError } = useGetEmployeesQuery();
  const [createEmployee, { isLoading: isCreating, reset: createReset, isError: isCreatingError, error: createErrorr }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating, reset: updateReset, isError: isUpdatingError, error: updateError }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const employees = data?.data ?? [];

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // validation utils
  const validateRequired = (value: string) => !!value?.length;
  const validateEmail = (email: string) =>
    !!email?.length &&
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  function validateEmployee(emp: Partial<Employee>) {
    return {
      firstName: !validateRequired(emp.firstName || '') ? 'First Name is Required' : undefined,
      lastName: !validateRequired(emp.lastName || '') ? 'Last Name is Required' : undefined,
      email: !validateEmail(emp.email || '') ? 'Invalid Email Format' : undefined
    };
  }

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'id',
        enableEditing: false
        // muiEditTextFieldProps: {
        //   required: true,
        //   error: !!validationErrors?.firstName,
        //   helperText: validationErrors?.firstName,
        //   onFocus: () => setValidationErrors((prev) => ({ ...prev, firstName: undefined }))
        // }
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, firstName: undefined }))
        }
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.lastName,
          helperText: validationErrors?.lastName,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, lastName: undefined }))
        }
      },
      {
        accessorKey: 'email',
        header: 'Email',
        muiEditTextFieldProps: {
          type: 'email',
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () => setValidationErrors((prev) => ({ ...prev, email: undefined }))
        }
      },
      {
        accessorKey: 'phone',
        header: 'Phone'
      },
      {
        accessorKey: 'department',
        header: 'Department'
      },
      {
        accessorKey: 'position',
        header: 'Position'
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        enableEditing: false,
        Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated At',
        enableEditing: false,
        Cell: ({ cell }) => cell.getValue<string>() && new Date(cell.getValue<string>()).toLocaleDateString()
      }
    ],
    [validationErrors]
  );

  // CREATE
  const handleCreateEmployee: MRT_TableOptions<Employee>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateEmployee(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createReset();
    const value = { ...values };
    delete value.id;
    delete value.createdAt;
    delete value.updatedAt;
    await createEmployee(value).unwrap();
    table.setCreatingRow(null);
  };

  // UPDATE
  const handleSaveEmployee: MRT_TableOptions<Employee>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateEmployee(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    updateReset();
    setValidationErrors({});
    const value = { ...values };
    delete value.createdAt;
    delete value.updatedAt;
    await updateEmployee(value);
    table.setEditingRow(null);
  };

  // DELETE
  // const openDeleteConfirmModal = (row: MRT_Row<Employee>) => {
  //   if (window.confirm('Are you sure you want to delete this employee?')) {
  //     deleteEmployee(row.original.id);
  //   }
  // };

  const table = useMaterialReactTable({
    columns,
    data: employees ?? [],
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps:
      isError || isUpdatingError || isCreatingError
        ? {
            color: 'error',
            children: updateError?.message || createErrorr?.message
          }
        : undefined,
    muiTableContainerProps: { sx: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateEmployee,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveEmployee,

    // custom modals
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create Employee</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Edit Employee</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons table={table} row={row} />
        </DialogActions>
      </>
    ),

    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        {/* <IconButton onClick={() => table.setEditingRow(row)}> */}
        <Link className="me-2 p-2 d-flex align-items-center border rounded" to="#">
          <i onClick={() => table.setEditingRow(row)} data-feather="edit" className="feather-edit" />{' '}
        </Link>

        <Link
          data-bs-toggle="modal"
          data-bs-target="#delete-modal"
          onClick={() => setDeleteId(row.original.id)}
          className="me-2 p-2 d-flex align-items-center border rounded error"
          to="#"
        >
          <i data-feather="trash-2" className="feather-trash-2" />
        </Link>
      </Box>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Add Employee
      </Button>
    ),

    state: {
      isLoading,
      isSaving: isCreating || isUpdating || isDeleting,
      showAlertBanner: isError || isUpdatingError || isCreatingError,
      showProgressBars: isFetching
    }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <MaterialReactTable table={table} />
      </div>
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">Delete Employee</h4>
                <p className="text-gray-6 mb-0 fs-16">Are you sure you want to delete employee?</p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteId) {
                        await deleteEmployee(deleteId);
                        setDeleteId(null); // reset after delete
                      }
                    }}
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-submit fs-13 fw-medium p-2 px-3"
                  >
                    Yes Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
