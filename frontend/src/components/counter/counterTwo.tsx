import React, { useState } from 'react';

type CounterTwoProps = {
  defaultValue?: number; // optional prop
};

const CounterTwo: React.FC<CounterTwoProps> = ({ defaultValue = 0 }) => {
  const [quantity, setQuantity] = useState(defaultValue);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <span className="quantity-btn" onClick={handleDecrement}>
        <i className="feather-16 feather icon-minus-circle" />
      </span>
      <input type="text" className="quntity-input p-0" value={quantity.toString()} onChange={handleChange} />
      <span className="quantity-btn" onClick={handleIncrement}>
        <i className="feather icon-plus-circle feather-16" />
      </span>
    </>
  );
};

export default CounterTwo;
