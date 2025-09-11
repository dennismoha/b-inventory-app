export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  createdAt: Date;
  updatedAt: Date;
}
