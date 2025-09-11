import { useState } from 'react';
import PropTypes from 'prop-types';
const CounterThree = () => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  interface HandleChangeEvent {
    target: { value: string };
  }

  const handleChange = (e: HandleChangeEvent) => {
    const value = e.target.value;
    const numericValue = parseInt(value, 10);

    if (value === '') {
      setQuantity(0);
    } else if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 99) {
      setQuantity(numericValue);
    }
  };

  return (
    <>
      <div className="product-quantity border-0 bg-secondary-transparent">
        <span className="quantity-btn" onClick={handleDecrement}>
          <i className="feather-16 feather icon-minus-circle" />
        </span>
        <input type="text" className="quntity-input bg-transparent form-control" value={quantity.toString()} onChange={handleChange} />
        <span className="quantity-btn" onClick={handleIncrement}>
          <i className="feather icon-plus-circle" />
        </span>
      </div>
    </>
  );
};

CounterThree.propTypes = {
  defaultValue: PropTypes.number
};
export default CounterThree;
