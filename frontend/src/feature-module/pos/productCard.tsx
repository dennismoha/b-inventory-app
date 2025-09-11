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

// type ProductCardProps = {
//   data: InventoryItem;
// };

// type InputData = {
//   data: InventoryItem;
// };

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
