// ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
// import CartCounter from '../../components/counter/counter';
import type { InventoryItems } from '../interface/features-interface';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import { addToCheckout } from '@core/redux/cart';
// import { CartCounter } from './CartCounter'; // Assuming you have CartCounter component.

interface ProductCardProps {
  productItem: InventoryItems;
  activeTab: string;
}

interface ProductsCard {
  supplier_products_id: string;
  // product_weight,
  inventoryId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

  stock_quantity: number;
  quantity: number;
  productName: string;
  price: number | undefined;
  VAT: number | undefined;
  discount: number | undefined;
  imageUrl: string;
  supplierName: string;
  unit: string;
  batch_inventory_id: string;
  total_stock_quantity: number;
}

const ProductList = (propsData: ProductsCard) => {
  // const productPrice = propsData.price;
  const data = useAppSelector((state) => state.cart);

  const dispatch = useAppDispatch();

  const {
    supplier_products_id,
    inventoryId,
    status,
    stock_quantity,
    //quantity, // Default value if not provided
    productName,
    price,
    unit,
    // VAT,
    discount,
    imageUrl,
    supplierName,
    total_stock_quantity,
    batch_inventory_id
  } = propsData;
  const filterData = data.cartProducts.filter((dat) => dat.supplier_products_id === supplier_products_id);

  console.log(' the filtered data is ', filterData);
  // Skip rendering if no product is found
  //   if (!product) return null;

  const handleAddToCart = () => {
    console.log('adding to cart');
    if (!price) {
      alert('cannot select unpriced product');
      return;
    }
    console.log('the stock quantity is ', stock_quantity);

    if (filterData[0]?.quantity > total_stock_quantity) {
      alert('items out of stock');
    }

    // if (stock_quantity == 0) {
    //   alert('items out of stock');
    //   return;
    // }

    dispatch(
      addToCheckout({
        supplier_products_id,
        // product_weight,
        inventoryId,
        status,

        stock_quantity,
        quantity: 1,
        productName,
        price: price ? price : 0,
        VAT: 0,
        discount: discount ? discount : 0,
        total_stock_quantity: Number(total_stock_quantity),
        batch_inventory_id,
        needsBatchLoad: false
      })
    );
  };

  return (
    // <div
    //   className={`tab_content ${activeTab === productItem.supplierProduct?.supplier.name || activeTab === 'all' ? 'active' : ''} `}
    //   data-tab={activeTab}
    // >
    //   <div className="row g-3">
    //     <div className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3" key={productItem.inventoryId}>
    <div className="product-info card mb-0" onClick={() => handleAddToCart()} tabIndex={0}>
      <Link to="#" className="pro-img">
        <img src={imageUrl || 'src/assets/img/products/default.png'} alt={productName} />
        <span>
          <i className="ti ti-circle-check-filled" />
        </span>
      </Link>
      <h6 className="cat-name">
        {/* <Link to="#">{activeTab === 'all' ? productItem.supplierProduct?.supplier?.name : activeTab}</Link> */}
        <Link to="#">{supplierName}</Link>
      </h6>
      <h6 className="product-name">
        <Link to="#">{productName}</Link>
      </h6>
      <div className="d-flex align-items-center justify-content-between price">
        <p className="text-gray-9 mb-0">{price ? `${price} kes per ${unit}` : 'Not priced'}</p>
        <div className="qty-item m-0">
          {/* <CartCounter /> */}
          quantity -{stock_quantity}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const propsData: ProductsCard = {
    supplier_products_id: props.productItem.supplier_products_id,
    // product_weight,
    inventoryId: props.productItem.inventoryId,
    status: props.productItem.status,
    stock_quantity: props.productItem.stock_quantity,
    quantity: props.productItem.stock_quantity,
    productName: props.productItem?.name,
    price: props.productItem.price,
    VAT: props.productItem.VAT,
    unit: props.productItem.unit_short_name,
    discount: props.productItem.discount,
    imageUrl: 'https://5.imimg.com/data5/NM/ZJ/XG/SELLER-4958637/cattle-feed-bags-500x500.jpg',
    supplierName: props.productItem.supplier_name,
    batch_inventory_id: props.productItem.batch_inventory_id,
    total_stock_quantity: props.productItem.total_stock_quantity
  };
  return <ProductList {...propsData} />;
};

export default ProductCard;

/**pos.tsx
 * So this is the rationale.
 * fetch inventory items with a query hook and store them in a local redux state.
 *    ----> this is the initial render
 * add a boolean varible for if added to cart. default is false.
 * Now that structure is what i should use for the rest of my code.
 * 
 * 
 * Now, I have a sidebar that groups items with respect to product name.
 * we should now take data from our state and group it.   const groupedInventory = useMemo(() => {
     return productsData.reduce((acc: Record<string, InventoryItems[]>, item: InventoryItems) => {
       const supplierName = item.supplier_name || 'Unknown Supplier';
       console.log('acc is ', acc);
       console.log('item is ', item);
 
       if (!acc[supplierName]) {
         acc[supplierName] = [];
       }
 
       acc[supplierName].push(item);
 
       return acc;
     }, {});
   }, [productsData]);
 
 * now this determines how many buttons i have on my sidebar.. but if i click on all, all items are displayed
     const inventoryItems = activeTab === 'all' ? Object.values(groupedInventory).flat() : groupedInventory[activeTab] || []; 

 * Now to display products. ProductCard.tsx comes in.
 *  Now in mys sidebar i can display either All products by clicking on the all button
 *  or products by a specific supplier by clicking on the supplier name. as displayed on the sidebar.
 *         {Object.keys(groupedInventory).map((supplier, index) => (
                           <li key={supplier} onClick={() => setActiveTab(supplier)} className={activeTab === supplier ? 'active' : ''}>
                             <Link to="#">
                               <img src={`/assets/img/categories/category-0${index + 2}.svg`} alt="Supplier" />
                             </Link>
                             <h6>
                               <Link to="#">{supplier}</Link>
                             </h6>
                           </li>
                         ))}

                         -----> this is the second rerender if any button is clicked. since activeTab is a dependency of inventoryItems is triggered and is a useState so this forces the whole component to rerender

and this is what sends productItem to ProductCard.tsx
     {inventoryItems.length > 0 ? (
                              inventoryItems.map((productItem: InventoryItems, idx: number) => (
                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                                  <ProductCard key={productItem.inventoryId || idx} productItem={productItem} activeTab={activeTab} />
                                </div>
                              ))
                            ) : (
                              <p>No products available</p>
                            )}
 * 
 * 
 * Product.tsx/ 
 * here we destructure the products and  use productList to display them as we pass them as props. const ProductCard: React.FC<ProductCardProps> = (props) => {
  const propsData: ProductsCard = {
    supplier_products_id: props.productItem.supplier_products_id,
    // product_weight,
    inventoryId: props.productItem.inventoryId,
    status: props.productItem.status,
    stock_quantity: props.productItem.stock_quantity,
    quantity: props.productItem.stock_quantity,
    productName: props.produc
    ....
    .....
}
    productList component inside productCard.tsx
    so here we display the products, 
    we also add products to cart but before that we :
        - check if product has got productPricing info. if yes, we proceed and if no we throw an alert that product cannot be added to cart or cannot select unpriced product
      -   fetch the produuct data from the cart to check if productQuantity is greater than total stock quantity. 
          if yes we throw an alert that items are out of stock
      -   if no we proceed to add to cart
    - we dispatch the addToCheckout action with the product details as payload.

    so :
      everytime  state is updated  this is triggered.   const data = useAppSelector((state) => state.cart);
      does it re-render the component  am not sure.
           
     then we also have a dispatch that dispatches the addToCheckout action.  const dispatch = useAppDispatch();
     so this also updates the state and the selector app there maybe fetches the rerenders.   dispatch(
      addToCheckout({
        supplier_products_id,
        // product_weight,
        inventoryId,
        status,

        stock_quantity,
        quantity: 1,
     =....
     ....
}
 And that's the end of the productCrd.tsx
    
 Now on our pos.tsx we also have the orderSidebar. this displays the customers, cart items, paymente summary etc etc.
 OrderSidebar.tsx

 
// const OrderSidebar = () => {
//   return (
//     <div className="col-md-12 col-lg-5 col-xl-4 ps-0 theiaStickySidebar d-lg-flex">
//       <aside className="product-order-list bg-secondary-transparent flex-fill">
//         <div className="card">
//          
//               </div>
//               {/* <div className="d-flex align-items-center gap-2">
//                 <span className="badge badge-dark fs-10 fw-medium badge-xs">#ORD123</span>
//                 <Link className="link-danger fs-16" to="#">
//                   <i className="ti ti-trash-x-filled" />
//                 </Link>
//               </div> 
//             </div>
//             {/* customer info 

//             <Customers />

//             <CartSection />

//             <PaymentSummary />
//             {/* end of order details 
//           </div>
//         </div>

//         <PaymentMethods />

//         <PaymentOrders />
//       </aside>
//     </div>
//   );
// };

so here customers:
  her we fetch customers from the backend using a query hook and display them in a select dropdown.
  Now two things happpen after csutomer data is back.
    1) we display ot on a dropdown. now. once it is selected, the onchange with handlechange handler dispatches the customerid to the cart redux state.
    Again, redux is updated there. will it cause a total re-render of the pos.tsx component? i don't know
    2) we use the useApp selector to fetch the customerId from the cart redux state and display it as the selected value of the dropdown.
     and that's it.
CartSEction.
  we use the useAppSelector to fetch cartProducts from the cart redux state and display them.    const carts = useAppSelector((state) => state.cart.cartProducts);
  Then we loop through the cart items and display. <div className="table-responsive">
            <table className="table table-borderless">
              <thead>
                <tr>
                  <th className="fw-bold bg-light">Item</th>
                  <th className="fw-bold bg-light">QTY</th>
                  <th className="fw-bold bg-light text-end">Cost</th>
                </tr>
              </thead>
              <tbody>
                {carts.map((data, idx) => (
                  <CartItem idx={idx} key={data.supplier_products_id} data={data} />
                ))}
              </tbody>
      WE use the cartItem component to display each cart item.
  That's it.

  CartItem component.
  Now here , we receive the cart item data as props and display them..
  Two things happens here.
    1) we display the cart products. we also use the useApp selector to select a product by inventoryid. this is  what is used to display the product Quantity
        const productIndex = useAppSelector((state) => selectProductByInventoryId(inventoryId)(state));
           <td>
                <div className="qty-item m-0">
                  {/* <CartCounter /> *
                  <CounterTwo
                    quantity={quantity}
                    productIndex={productIndex!.quantity}
                    stock_quantity={total_stock_quantity}
                    inventoryId={inventoryId}
                  />
                </div>
              </td>

    So this component is determined  by how the addToCheckout reducer workks and this reducer is triggered from the productCard.tsx component.
  That's it.
  
  



 **/
