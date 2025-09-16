import CounterTwo from './newcounter';
import { Link } from 'react-router';
import Customers from './customer';
// import CartCounter from '@components/counter/counter';
import { useAppDispatch, useAppSelector } from '@core/redux/store';
import {
  // changeQuantity,
  clearCart,
  changePaymentMethod,
  type cartProducts
} from '@core/redux/cart';
import { selectProductByInventoryId } from '@core/redux/selectors';
import { useCreateTransactionMutation } from '@core/redux/api/inventory-api';
import { useEffect } from 'react';
// import useApp from 'antd/es/app/useApp';
// import Toasts from '@components/toasts';

import { Modal } from 'bootstrap';

type CartData = {
  data: cartProducts;
  idx: number;
};

const CartItem: React.FC<CartData> = ({ data, idx }) => {
  const {
    inventoryId,
    // stock_quantity,
    quantity,
    productName,
    price,
    total_stock_quantity
  } = data;
  // const [
  //   createTransaction,
  //   { reset, isLoading: transactionLoading, isError: transactionError, isSuccess: transactionSuccess, error: TransactionErrorMessage }
  // ] = useCreateTransactionMutation();

  // Use the selector to get the product index by inventoryId

  const productIndex = useAppSelector((state) => selectProductByInventoryId(inventoryId)(state));
  console.log('===============product index is ', productIndex);
  console.log('cart item value of quantity is ', quantity);

  // const [detail, setDetail] = useState<CheckoutProducts>();
  // const dispatch = useAppDispatch();
  // useEffect(() => {
  //   if (transactionSuccess) {
  //     dispatch(clearCart()); // Clear cart
  //     reset(); // Reset API state
  //     // toast.success(' successfull transaction!'); // Success toast after clearing cart
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [transactionSuccess, reset]);
  // const cartProducts = useAppSelector((state) => state.cart);

  return (
    <tr key={idx}>
      <td>
        <div className="d-flex align-items-center">
          <Link className="delete-icon" to="#" data-bs-toggle="modal" data-bs-target="#delete">
            <i className="ti ti-trash-x-filled" />
          </Link>
          <h6 className="fs-13 fw-normal">
            <Link to="#" className=" link-default" data-bs-toggle="modal" data-bs-target="#products">
              {productName}
            </Link>
          </h6>
        </div>
      </td>
      <td>
        <div className="qty-item m-0">
          {/* <CartCounter /> */}
          <CounterTwo
            quantity={quantity}
            productIndex={productIndex!.quantity}
            stock_quantity={total_stock_quantity}
            inventoryId={inventoryId}
          />
        </div>
      </td>
      <td className="fs-13 fw-semibold text-gray-9 text-end">{price * quantity} ksh</td>
    </tr>
  );
};

const CartSection = () => {
  const carts = useAppSelector((state) => state.cart.cartProducts);
  const dispatch = useAppDispatch();

  return (
    <div className="product-added block-section">
      <div className="head-text d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <h5 className="me-2">Order Details</h5>
          <div className="badge bg-light text-gray-9 fs-12 fw-semibold py-2 border rounded">
            Items : <span className="text-teal">{carts.length}</span>
          </div>
        </div>
        <button className="d-flex align-items-center clear-icon fs-10 fw-medium" onClick={() => dispatch(clearCart())}>
          Clear all
        </button>
      </div>
      <div className="product-wrap">
        <div className="empty-cart" style={{ display: carts.length === 0 ? 'block' : 'none' }}>
          <div className="fs-24 mb-1">
            <i className="ti ti-shopping-cart" />
          </div>
          <p className="fw-bold">No Products Selected</p>
        </div>

        <div className="product-list border-0 p-0" style={{ display: carts.length > 0 ? 'block' : 'none' }}>
          <div className="table-responsive">
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
            </table>
          </div>
        </div>

        {/* {carts.length === 0 ? (
          <div className="empty-cart">
            
            <div className="fs-24 mb-1">
              <i className="ti ti-shopping-cart" />
            </div>
            <p className="fw-bold">No Products Selected</p>
          </div>
        ) : (
          <>
            <div>heeeeeyjjjjjjjjjjjj-{JSON.stringify(carts)}</div>
            <div className="product-list border-0 p-0">
              <div className="table-responsive">
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
                      <CartItem data={data} idx={idx} key={idx} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )} */}
      </div>
      {/* <div className="discount-item d-flex align-items-center justify-content-between  bg-purple-transparent mt-3 flex-wrap gap-2">
        <div className="d-flex align-items-center">
          <span className="bg-purple discount-icon br-5 flex-shrink-0 me-2">
            <img src="src/assets/img/icons/discount-icon.svg" alt="img" />
          </span>
          <div>
            <h6 className="fs-14 fw-bold text-purple mb-1">Discount 5%</h6>
            <p className="mb-0">For $20 Minimum Purchase, all Items</p>
            <p></p>
          </div>
        </div>
        <Link to="#" className="close-icon">
          <i className="ti ti-trash" />
        </Link>
      </div> */}
    </div>
  );
};

const PaymentMethods = () => {
  const dispatch = useAppDispatch();
  const activePaymentMethod = useAppSelector((state) => state.cart.paymentMethod);
  const paymentButtonStyle = (method: string, activeMethod: string) =>
    method === activeMethod ? { backgroundColor: '#fff6ee', borderColor: '#fe9f43', color: '#fe9f43' } : {};
  // const paymentSelected = useAppSelector((state) => state.cart.paymentMethod);
  console.log('active payment method is ', activePaymentMethod);
  return (
    <div className="card payment-method">
      <div className="card-body">
        <h5 className="mb-3">Select Payment</h5>
        <div className="row align-items-center methods g-2">
          {/* <div className="col-sm-6 col-md-4 d-flex"> */}
          {/* <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#payment-cash"
            > */}
          {/* <img src="src/assets/img/icons/cash-icon.svg" className="me-2" alt="img" /> */}
          {/* <img src="/assets/img/icons/cash-icon.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Cash</p>
            </Link> */}
          {/* </div> */}
          <div className="col-sm-6 col-md-4 d-flex">
            <button
              onClick={() => dispatch(changePaymentMethod({ paymentMethod: 'CASH' }))}
              // className={`payment-item d-flex align-items-center justify-content-center p-2 flex-fill`}
              className={`payment-item d-flex align-items-center justify-content-center p-2 flex-fill 
         `}
              style={paymentButtonStyle('CASH', activePaymentMethod)}
            >
              <img src="/assets/img/icons/cash-icon.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Cash</p>
            </button>
          </div>
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <button
              onClick={() => dispatch(changePaymentMethod({ paymentMethod: 'CARD' }))}
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
            >
              <img src="/assets/img/icons/card.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Card</p>
            </button>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#payment-card"
            >
              <img src="/assets/img/icons/card.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Card</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#payment-points"
            >
              <img src="/assets/img/icons/points.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Points</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#payment-deposit"
            >
              <img src="/assets/img/icons/deposit.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Deposit</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#payment-cheque"
            >
              <img src="/assets/img/icons/cheque.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Cheque</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#gift-payment"
            >
              <img src="/assets/img/icons/giftcard.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Gift Card</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#scan-payment"
            >
              <img src="/assets/img/icons/scan-icon.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Scan</p>
            </Link>
          </div> */}
          <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              onClick={() => dispatch(changePaymentMethod({ paymentMethod: 'CREDIT' }))}
              //  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              className={`payment-item d-flex align-items-center justify-content-center p-2 flex-fill 
          ${activePaymentMethod === 'CREDIT' ? 'active-payment' : ''}`}
              style={paymentButtonStyle('CREDIT', activePaymentMethod)}
            >
              <img src="/assets/img/icons/paylater.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Pay Later</p>
            </Link>
          </div>
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link to="#" className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill">
              <img src="/assets/img/icons/external.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">External</p>
            </Link>
          </div> */}
          {/* <div className="col-sm-6 col-md-4 d-flex">
            <Link
              to="#"
              className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
              data-bs-toggle="modal"
              data-bs-target="#split-payment"
            >
              <img src="/assets/img/icons/split-bill.svg" className="me-2" alt="img" />
              <p className="fs-14 fw-medium">Split Bill</p>
            </Link>
          </div> */}
        </div>
      </div>
    </div>
    // <div className="card payment-method">
    //   <div className="card-body">
    //     <h5 className="mb-3">Select Payment</h5>
    //     <div className="row align-items-center methods g-2">
    //       {['Cash', 'Card', 'Points', 'Deposit', 'Cheque', 'Gift Card', 'Scan', 'Pay Later', 'External', 'Split Bill'].map(
    //         (method, idx) => (
    //           <div className="col-sm-6 col-md-4 d-flex" key={idx}>
    //             <Link to="#" className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill">
    //               <img src={`src/assets/img/icons/${method.toLowerCase().replace(' ', '-')}.svg`} className="me-2" alt="icon" />
    //               <p className="fs-14 fw-medium">{method}</p>
    //             </Link>
    //           </div>
    //         )
    //       )}
    //     </div>
    //   </div>
    // </div>
  );
};

const PaymentOrders = () => {
  const [
    createTransaction,
    { reset, isLoading: loading, isError: transactionError, isSuccess: transactionSuccess, error: TransactionErrorMessage }
  ] = useCreateTransactionMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (transactionSuccess) {
      dispatch(clearCart()); // Clear cart
      const modalEl = document.getElementById('payment-completed');
      if (modalEl) {
        const modal = new Modal(modalEl);
        modal.show();
      }
      reset();
    }
  }, [transactionSuccess, reset]);

  useEffect(() => {
    if (transactionError) {
      alert(JSON.stringify(TransactionErrorMessage.message));
    }
    reset();
  }, [transactionError]);

  const cartProducts = useAppSelector((state) => state.cart);

  const handleCheckoutHandler = () => {
    console.log('here we are', cartProducts);
    if (cartProducts.cartProducts.length === 0) {
      alert('no items added');
      return;
    }
    createTransaction(cartProducts);
  };
  return (
    <div className="btn-row d-flex align-items-center justify-content-between gap-3">
      {/* {
        <Link to="#" className="btn btn-white flex-fill" data-bs-toggle="modal" data-bs-target="#hold-order">
          <i className="ti ti-printer me-2" /> Print Order
        </Link>
      } */}
      {loading ? (
        <p>processing payments</p>
      ) : (
        <button onClick={handleCheckoutHandler} className="btn btn-secondary flex-fill">
          <i className="ti ti-shopping-cart me-2" /> complete payment
        </button>
      )}
    </div>
  );
};

const PaymentSummary = () => {
  const totalcost = useAppSelector((state) => state.cart.totalCost);
  return (
    <div className="order-total bg-total bg-white p-0">
      <h5 className="mb-3">Payment Summary</h5>
      <table className="table table-responsive table-borderless">
        <tbody>
          {/* <tr>
            <td>
              Shipping
              <Link to="#" className="ms-3 link-default" data-bs-toggle="modal" data-bs-target="#shipping-cost">
                <i className="ti ti-edit" />
              </Link>
            </td>
            <td className="text-gray-9 text-end">kes 0.00</td>
          </tr>
          <tr>
            <td>
              Tax
              <Link to="#" className="ms-3 link-default" data-bs-toggle="modal" data-bs-target="#order-tax">
                <i className="ti ti-edit" />
              </Link>
            </td>
            <td className="text-gray-9 text-end">kes 0.00</td>
          </tr>
          <tr>
            <td>
              Coupon
              <Link to="#" className="ms-3 link-default" data-bs-toggle="modal" data-bs-target="#coupon-code">
                <i className="ti ti-edit" />
              </Link>
            </td>
            <td className="text-gray-9 text-end">kes 0.00</td>
          </tr>
          <tr>
            <td>
              <span className="text-danger">Discount</span>
              <Link to="#" className="ms-3 link-default" data-bs-toggle="modal" data-bs-target="#discount">
                <i className="ti ti-edit" />
              </Link>
            </td>
            <td className="text-danger text-end">kes 0.00</td>
          </tr>
          <tr>
            <td>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="round" defaultChecked />
                <label className="form-check-label" htmlFor="round">
                  Roundoff
                </label>
              </div>
            </td>
            <td className="text-gray-9 text-end">+0.11</td>
          </tr> */}
          <tr>
            <td>Sub Total</td>
            <td className="text-gray-9 text-end">kes {totalcost.subtotal}</td>
          </tr>
          <tr>
            <td className="fw-bold border-top border-dashed">Total Payable</td>
            <td className="text-gray-9 fw-bold text-end border-top border-dashed">kes {totalcost.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const OrderSidebar = () => {
  return (
    <div className="col-md-12 col-lg-5 col-xl-4 ps-0 theiaStickySidebar d-lg-flex">
      <aside className="product-order-list bg-secondary-transparent flex-fill">
        <div className="card">
          <div className="card-body">
            <div className="order-head d-flex align-items-center justify-content-between w-100">
              <div>
                {/* <h3>Order List</h3> */}
                <h3> items list</h3>
              </div>
              {/* <div className="d-flex align-items-center gap-2">
                <span className="badge badge-dark fs-10 fw-medium badge-xs">#ORD123</span>
                <Link className="link-danger fs-16" to="#">
                  <i className="ti ti-trash-x-filled" />
                </Link>
              </div> */}
            </div>
            {/* customer info */}

            <Customers />

            <CartSection />

            <PaymentSummary />
            {/* end of order details */}
          </div>
        </div>

        <PaymentMethods />

        <PaymentOrders />
      </aside>
    </div>
  );
};

export default OrderSidebar;
