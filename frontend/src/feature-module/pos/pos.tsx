import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// import Select from 'react-select';
// import { Check } from 'react-feather';
// import CartCounter from '../../components/counter/counter';
// import CounterTwo from '../../components/counter/counterTwo';
import PosModals from '../../core/modals/pos-modal/posModalstjsx';
import {
  // useCreateTransactionMutation,
  useGetInventoryItemsQuery
} from '@core/redux/api/inventory-api';
import type { InventoryItems } from '../interface/features-interface';
import ProductCard from './productCard';
// import Customers from './customer';
import OrderSidebar from './cartorder';
import { useAppSelector } from '@core/redux/store';

// type GroupedInventory = Record<string, InventoryItem[]>;

type ContainersProps = {
  children: React.ReactNode;
};

const Containers: React.FC<ContainersProps> = ({ children }) => {
  return (
    <div className="main-wrapper pos-five">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row pos-wrapper">
            {/* Products */}
            <div className="col-md-12 col-lg-7 col-xl-8 d-flex">
              <div className="pos-categories tabs_wrapper p-0 flex-fill">
                <div className="content-wrap">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pos = () => {
  const [activeTab, setActiveTab] = useState('all');
  // const [showAlert, setShowAlert] = useState(true);
  // const [showAlert1, setShowAlert1] = useState(true);
  const {
    data: InventoryItemsData,
    isError: isInventoryFetchingError,
    // error: inventoryFetchingError,
    isLoading: isInventoryFetchingLoading
  } = useGetInventoryItemsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });
  //   const [
  //     createTransaction,
  //     { reset, isLoading: transactionLoading, isError: transactionError, isSuccess: transactionSuccess, error: TransactionErrorMessage }
  //   ] = useCreateTransactionMutation();

  //   console.log('inventory items are ', InventoryItemsData?.data);

  // group the products with respect to suppliers.

  const Location = useLocation();
  // const options = [
  //   { value: '1', label: 'Walk in Customer' },
  //   { value: '2', label: 'John' },
  //   { value: '3', label: 'Smith' },
  //   { value: '4', label: 'Ana' },
  //   { value: '4', label: 'Elza' }
  // ];

  const userName: string = useAppSelector((state) => state.auth.user.username);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const productInfo = target.closest('.product-info') as HTMLElement | null;

      if (productInfo) {
        productInfo.classList.toggle('active');

        const hasActive = document.querySelectorAll('.product-info.active').length > 0;

        const emptyCart = document.querySelector('.product-wrap .empty-cart') as HTMLElement | null;
        const productList = document.querySelector('.product-wrap .product-list') as HTMLElement | null;

        if (hasActive) {
          if (emptyCart) emptyCart.style.display = 'none';
          if (productList) productList.style.display = 'block';
        } else {
          if (emptyCart) emptyCart.style.display = 'flex';
          if (productList) productList.style.display = 'none';
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.body.classList.add('pos-page');

    return () => {
      document.removeEventListener('click', handleClick);
      document.body.classList.remove('pos-page');
    };
    // }, [Location.pathname, showAlert1]);
  }, [Location.pathname]);

  const productsData = InventoryItemsData?.data ?? [];

  const groupedInventory = useMemo(() => {
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

  console.log('groupd data is ', groupedInventory);

  if (isInventoryFetchingError) {
    return <div>inventory loading</div>;
  }

  if (!InventoryItemsData?.data || InventoryItemsData.data.length === 0) {
    return (
      <Containers>
        {' '}
        <div>No products available.</div>
      </Containers>
    );
  }

  if (isInventoryFetchingLoading) {
    return <div>loading...</div>;
  }

  const inventoryItems = activeTab === 'all' ? Object.values(groupedInventory).flat() : groupedInventory[activeTab] || [];

  console.log('inventory items are ', inventoryItems);

  return (
    <div className="main-wrapper pos-five">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row pos-wrapper">
            {/* Products */}
            <div className="col-md-12 col-lg-7 col-xl-8 d-flex">
              <div className="pos-categories tabs_wrapper p-0 flex-fill">
                <div className="content-wrap">
                  <div className="tab-wrap">
                    <ul className="tabs owl-carousel pos-category5">
                      <li id="all" onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>
                        <Link to="#">
                          <img src="/assets/img/categories/category-01.svg" alt="Categories" />
                        </Link>
                        <h6>
                          <Link to="#">All</Link>
                        </h6>
                      </li>
                      <ul className="tabs owl-carousel pos-category5">
                        {/* <li id="all" onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>
                          <Link to="#">
                            <img src="src/assets/img/categories/category-01.svg" alt="Categories" />
                          </Link>
                          <h6>
                            <Link to="#">All</Link>
                          </h6>
                        </li> */}
                        {Object.keys(groupedInventory).map((supplier) => (
                          <li key={supplier} onClick={() => setActiveTab(supplier)} className={activeTab === supplier ? 'active' : ''}>
                            <Link to="#">{/* <img src={`/assets/img/categories/category-0${index + 2}.svg`} alt="Supplier" /> */}</Link>
                            <h6>
                              <Link to="#">{supplier}</Link>
                            </h6>
                          </li>
                        ))}
                      </ul>
                    </ul>
                  </div>
                  <div className="tab-content-wrap">
                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                      <div className="mb-3">
                        <h5 className="mb-1">Welcome, {userName}</h5>
                        <p>
                          {new Date().toLocaleDateString('en-us', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="d-flex align-items-center flex-wrap mb-2">
                        {/* <div className="input-icon-start search-pos position-relative mb-2 me-3">
                          <span className="input-icon-addon">
                            <i className="ti ti-search" />
                          </span>
                          <input type="text" className="form-control" placeholder="Search Product" />
                        </div> */}
                        {/* <Link to="#" className="btn btn-sm btn-dark mb-2 me-2">
                          <i className="ti ti-tag me-1" />
                          View All Brands
                        </Link> */}
                        {/* <Link to="#" className="btn btn-sm btn-primary mb-2">
                          <i className="ti ti-star me-1" />
                          Featured
                        </Link> */}
                      </div>
                    </div>
                    {/* the products section */}
                    <div className="pos-products">
                      <div className="tabs_container">
                        <div
                          className={`tab_content ${activeTab === activeTab || activeTab === 'all' ? 'active' : ''} `}
                          data-tab={activeTab}
                        >
                          <div className="row g-3">
                            {inventoryItems.length > 0 ? (
                              inventoryItems.map((productItem: InventoryItems, idx: number) => (
                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                                  <ProductCard key={productItem.inventoryId || idx} productItem={productItem} activeTab={activeTab} />
                                </div>
                              ))
                            ) : (
                              <p>No products available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Products */}
            {/* Order Details */}

            <OrderSidebar />
            {/* /Order Details */}
          </div>
          <div className="pos-footer bg-white p-3 border-top">
            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
              {/* <Link
                to="#"
                className="btn btn-orange d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#hold-order"
              >
                <i className="ti ti-player-pause me-2" />
                Hold
              </Link>
              <Link to="#" className="btn btn-info d-inline-flex align-items-center justify-content-center">
                <i className="ti ti-trash me-2" />
                Void
              </Link>
              <Link
                to="#"
                className="btn btn-cyan d-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#payment-completed"
              >
                <i className="ti ti-cash-banknote me-2" />
                Payment
              </Link>
              <Link
                to="#"
                className="btn btn-secondary d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#orders"
              >
                <i className="ti ti-shopping-cart me-2" />
                View Orders
              </Link>
              <Link
                to="#"
                className="btn btn-indigo d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#reset"
              >
                <i className="ti ti-reload me-2" />
                Reset
              </Link> */}
              {/* <Link
                to="#"
                className="btn btn-danger d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#recents"
              >
                <i className="ti ti-refresh-dot me-2" />
                Transaction
              </Link> */}
            </div>
          </div>
        </div>
      </div>
      <PosModals />
    </div>
  );
};

export default Pos;
