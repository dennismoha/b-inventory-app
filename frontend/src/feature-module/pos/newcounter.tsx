import { changeQuantity } from '@core/redux/cart';
import { useAppDispatch } from '@core/redux/store';
import React from 'react';

type CounterTwoProps = {
  inventoryId: string;
  productIndex: number;
  stock_quantity: number;
  quantity: number;
};

const CounterTwo: React.FC<CounterTwoProps> = ({ quantity, inventoryId, productIndex, stock_quantity }) => {
  const dispatch = useAppDispatch();

  const handleDecrement = () => {
    dispatch(
      changeQuantity({
        inventoryId: inventoryId,
        quantity: quantity - 1
      })
    );
  };

  const handleIncrement = () => {
    if (productIndex + 1 > stock_quantity) {
      alert('items cannot be greater than stock');
      return;
    }
    dispatch(
      changeQuantity({
        inventoryId: inventoryId,
        quantity: quantity + 1
      })
    );
  };

  return (
    <>
      <span className="quantity-btn" onClick={handleDecrement}>
        <i className="feather-16 feather icon-minus-circle" />
      </span>
      <input type="text" className="quntity-input p-0" value={quantity} disabled />
      {/* <span className="quntity-input p-0">price-{quantity} </span> */}
      <span className="quantity-btn" onClick={handleIncrement}>
        <i className="feather icon-plus-circle feather-16" />
      </span>
    </>
  );
};

export default CounterTwo;
