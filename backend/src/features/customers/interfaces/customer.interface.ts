// Customer Type (in interfaces/customer.interface.ts)
// export interface Customer {
//   customerId: string;
//   name: string;
//   email: string;
//   phone: string;

//   firstName: string; // Customer's first name
//   lastName: string; // Customer's last name

//   phoneNumber: string;
//   address: string; // Optional: Customer's address

//   country: string; // Optional: Customer's country
//   createdAt: Date;
//   updatedAt: Date;
//   status: string; // Customer status: "active", "inactive", etc.
//   loyaltyPoints: number;
//   totalSpent: number;

//   notes: string; // Optional: Any special notes or preferences about the customer
//   preferredPaymentMethod: string; // Optional: Preferred payment method (e.g., Credit card, PayPal)
// }

export interface Customer {
  firstName: string; // Customer's first name
  lastName: string; // Customer's last name
  email: string;
  phoneNumber: string;
  address: string | null; // Optional: Customer's address

  country: string | null; // Optional: Customer's country
  createdAt: Date;
  updatedAt: Date;
  status: string | null; // Customer status: "active", "inactive", etc.
  loyaltyPoints: number | null;
  totalSpent: number | null;

  notes: string | null; // Optional: Any special notes or preferences about the customer
  preferredPaymentMethod: string | null; // Optional: Preferred payment method (e.g., Credit card, PayPal)
}
