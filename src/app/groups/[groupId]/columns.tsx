'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@prisma/client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { format } from 'date-fns';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'employeeId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee ID" />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return name || `Employee ${row.getValue('employeeId')}`;
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined On" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return format(date, 'MMM dd, yyyy');
    },
  },
];