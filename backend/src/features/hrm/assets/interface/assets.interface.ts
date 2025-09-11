import { Employee } from '../../employees/interfaces/employee.interface';

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  description: string | null;
  purchaseDate: Date;
  purchaseCost: number;
  supplier: string | null;
  location: string | null;
  status: string;
  depreciation: number | null;
  usefulLifeYears: number | null;
  custodianId: string | null;
  custodian?: Employee | null;
  createdAt: Date;
  updatedAt: Date;
}
