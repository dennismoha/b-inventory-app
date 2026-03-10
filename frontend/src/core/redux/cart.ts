import type { InventoryItem } from '@/feature-module/interface/features-interface';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import { InventoryItem } from '@/app/(admin)/admin/inventory/interfaces/inventory-interface';
export type cartProducts = Pick<InventoryItem, 'inventoryId' | 'status' | 'stock_quantity' | 'supplier_products_id'> & {
  quantity: number;
  productName: string;
  price: number;
  VAT: number;
  discount: number;
  supplier_products_id: string;
  stock_quantity: number;
  total_stock_quantity: number;
  batch_inventory_id: string;
  needsBatchLoad: boolean; // if quantity is greater than stock quantity but less than total_Stock_quantity then this is true
};
export interface ProductItems {
  cartProducts: cartProducts[];
  statusTab: boolean;
  totalCost: {
    total: number;
    subtotal: number;
  };
  paymentMethod: 'CASH' | 'BANK' | 'CREDIT' | 'CARD';
  customerId?: string;
}
const initialState: ProductItems = {
  cartProducts: [], // Initialize the cartProducts as an empty array
  statusTab: false, // Default statusTab value
  totalCost: {
    total: 0,
    subtotal: 0
  },
  paymentMethod: 'CASH',
  customerId: ''
};

const checkoutSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCheckout(state, action: PayloadAction<cartProducts>) {
      const {
        inventoryId,
        quantity,
        status,
        batch_inventory_id,
        stock_quantity,
        productName,
        price,
        VAT,
        discount,
        supplier_products_id,
        total_stock_quantity
      } = action.payload;
      console.log('total is ', quantity + stock_quantity + total_stock_quantity);
      console.log('total is ', 'quantity', quantity, 'stock quantity', stock_quantity, 'total stock quantity', typeof total_stock_quantity);
      console.log(
        'type of quantty',
        typeof quantity,
        ' type of stock_quantity',
        typeof stock_quantity,
        'type of total_stock_quantity ',
        total_stock_quantity
      );
      console.log(
        'sum of quantity and stock_quantty',
        quantity + stock_quantity,
        'quantity and tt_stockQuantuty',
        quantity + total_stock_quantity,
        ' sum of stock quantity and total+stock_quantity ',
        stock_quantity + total_stock_quantity
      );

      console.log('string to number', typeof  Number(stock_quantity));
      // Find if the product already exists in the cartProducts
      const indexProductId = state.cartProducts.findIndex((item) => item.inventoryId === inventoryId);
      if (indexProductId >= 0) {
        // Update its quantity
        state.cartProducts[indexProductId].quantity += Number(quantity);
        state.cartProducts[indexProductId].needsBatchLoad =
          Number(state.cartProducts[indexProductId].quantity) >= Number(stock_quantity) &&
          Number(state.cartProducts[indexProductId].quantity) <= Number(total_stock_quantity)
            ? true
            : false;
      } else {
        // Add new product

        state.cartProducts.push({
          inventoryId,
          quantity: Number(quantity),
          status,
          stock_quantity: Number(stock_quantity),
          productName,
          price: Number(price),
          VAT: Number(VAT),
          discount: Number(discount),
          supplier_products_id,
          total_stock_quantity: Number(total_stock_quantity),
          batch_inventory_id,
          needsBatchLoad: Number(quantity) >= Number(stock_quantity) && Number(quantity) <= Number(total_stock_quantity) ? true : false
        });
      }

      // if (indexProductId >= 0) {
      //   // Update its quantity
      //   state.cartProducts[indexProductId].quantity += quantity;
      //   state.cartProducts[indexProductId].needsBatchLoad =
      //     state.cartProducts[indexProductId].quantity >= stock_quantity &&
      //     state.cartProducts[indexProductId].quantity <= total_stock_quantity
      //       ? true
      //       : false;
      // } else {
      //   // Add new product
      //   state.cartProducts.push({
      //     inventoryId,
      //     quantity,
      //     status,
      //     stock_quantity,
      //     productName,
      //     price: Number(price),
      //     VAT,
      //     discount,
      //     supplier_products_id,
      //     total_stock_quantity,
      //     batch_inventory_id,
      //     needsBatchLoad: quantity >= stock_quantity && quantity <= total_stock_quantity ? true : false
      //   });
      // }

      // Use each item's own values, not the payload values
      const subtotal = state.cartProducts.reduce((total, item) => total + item.quantity * item.price, 0);

      const totalVAT = state.cartProducts.reduce((total, item) => total + (item.quantity * item.price * item.VAT) / 100, 0);

      const totalDiscount = state.cartProducts.reduce((total, item) => total + (item.quantity * item.price * item.discount) / 100, 0);

      const totalCost = subtotal + totalVAT - totalDiscount;

      state.totalCost.subtotal = subtotal;
      state.totalCost.total = totalCost;
    },

    // addToCheckout(state, action: PayloadAction<cartProducts>) {
    //   let {
    //     inventoryId,
    //     quantity,
    //     status,
    //     batch_inventory_id,
    //     stock_quantity,
    //     productName,
    //     price,
    //     VAT,
    //     discount,
    //     supplier_products_id,
    //     total_stock_quantity
    //   } = action.payload;
    //   price = Number(price);
    //   // Find if the product already exists in the cartProducts
    //   const indexProductId = state.cartProducts.findIndex((item) => item.inventoryId === inventoryId);

    //   if (indexProductId >= 0) {
    //     console.log('the state index product is ', state.cartProducts[indexProductId]);
    //     // If the product is found, update its quantity
    //     state.cartProducts[indexProductId].quantity += quantity;
    //   } else {
    //     // If the product does not exist, add a new product to the cart
    //     state.cartProducts.push({
    //       inventoryId,
    //       quantity,
    //       status,
    //       stock_quantity,
    //       productName,
    //       price,
    //       VAT,
    //       discount,
    //       supplier_products_id,
    //       total_stock_quantity,
    //       batch_inventory_id,
    //       needsBatchLoad: quantity > stock_quantity && quantity < total_stock_quantity ? true : false
    //     });
    //   }

    //   // Calculate the subtotal (sum of all item prices before VAT and discount)
    //   const subtotal = state.cartProducts.reduce((total, item) => {
    //     return total + item.quantity * price; // Multiply quantit by price for each item
    //   }, 0);

    //   // Calculate the total VAT (based on the subtotal and each item's VAT percentage)
    //   const totalVAT = state.cartProducts.reduce((total, item) => {
    //     return total + (item.quantity * price * VAT) / 100; // VAT is a percentage
    //   }, 0);

    //   // Calculate the total discount (based on each item's discount percentage)
    //   const totalDiscount = state.cartProducts.reduce((total, item) => {
    //     return total + (item.quantity * price * item.discount) / 100; // Discount is a percentage
    //   }, 0);

    //   // Calculate the total cost (subtotal + VAT - discount)
    //   const totalCost = subtotal + totalVAT - totalDiscount;

    //   console.log('totalCost is ', totalCost);

    //   // Update the state with the calculated values
    //   state.totalCost.subtotal = subtotal; // Subtotal is before VAT and discount
    //   state.totalCost.total = totalCost; // Total includes VAT and subtracts discount
    // },
    changeQuantity(state, action: PayloadAction<Pick<cartProducts, 'inventoryId' | 'quantity'>>) {
      const { inventoryId, quantity } = action.payload;

      // Find the product in the cartProducts
      const indexProductId = state.cartProducts.findIndex((item) => item.inventoryId === inventoryId);

      if (indexProductId >= 0) {
        // If the product is found, update the quantity
        if (quantity > 0) {
          const k = state.cartProducts[indexProductId];

          k.quantity = quantity;
        } else {
          // If quantity is 0 or less, remove the product from the cart
          state.cartProducts = state.cartProducts.filter((item) => item.inventoryId !== inventoryId);
        }
      }

      // Calculate the total cost of all items in the cart after the update
      //  state.totalCost = state.cartProducts.reduce((total, item) => {
      //     return total + (item.quantity * item.price); // Multiply quantity by pricing for each item
      // }, 0);

      // Calculate the subtotal (sum of all item prices before VAT and discount)
      const subtotal = state.cartProducts.reduce((total, item) => {
        return total + item.quantity * item.price; // Multiply quantity by price for each item
      }, 0);

      // Calculate the total VAT (based on the subtotal and each item's VAT percentage)
      const totalVAT = state.cartProducts.reduce((total, item) => {
        return total + (item.quantity * item.price * item.VAT) / 100; // VAT is a percentage
      }, 0);

      // Calculate the total discount (based on each item's discount percentage)
      const totalDiscount = state.cartProducts.reduce((total, item) => {
        return total + (item.quantity * item.price * item.discount) / 100; // Discount is a percentage
      }, 0);

      // Calculate the total cost (subtotal + VAT - discount)
      const totalCost = subtotal + totalVAT - totalDiscount;

      // Update the state with the calculated values
      state.totalCost.subtotal = subtotal; // Subtotal is before VAT and discount
      state.totalCost.total = totalCost; // Total includes VAT and subtracts discount
    },
    clearCart() {
      // Reset to initial state
      return initialState;
    },
    changeCustomerId(state, action: PayloadAction<Pick<ProductItems, 'customerId'>>) {
      const { customerId } = action.payload;
      state.customerId = customerId;
    },
    changePaymentMethod(state, action: PayloadAction<Pick<ProductItems, 'paymentMethod'>>) {
      const { paymentMethod } = action.payload;
      state.paymentMethod = paymentMethod;
    },
    toggleStatusTab(state) {
      if (state.statusTab === false) {
        state.statusTab = true;
      } else {
        state.statusTab = false;
      }
    }
  }
});
export const { addToCheckout, changeQuantity, toggleStatusTab, changeCustomerId, changePaymentMethod, clearCart } = checkoutSlice.actions;
export default checkoutSlice.reducer;
