/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { setupListeners } from '@reduxjs/toolkit/query';

import sidebarSlice from './sidebarSlice';
import commonSlice from './commonSlice';
import MainReducer from './reducer';
import PosSession from './pos-session';
import themeSettingSlice from './themeSettingSlice';
import { getPreloadedState, saveToLocalStorage } from './localStorage';
import authSlice from './authslice';

// import globalReducer from '@/app/redux/state';
// import CategoryReduce from '@/app/redux/state/categories';
import checkoutSlice from './cart';
// import { api } from '@/app/redux/state/api';
import { InventoryApi } from './api/inventory-api';

/*  REDUX PERSIST SETUP */
const createNoopStorage = () => ({
  getItem(_key: any) {
    return Promise.resolve(null);
  },
  setItem(_key: any, value: any) {
    return Promise.resolve(value);
  },
  removeItem(_key: any) {
    return Promise.resolve();
  }
});

const storage = typeof window === 'undefined' ? createNoopStorage() : createWebStorage('local');

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['common', 'sidebar', 'rootReducer', 'themeSetting', 'auth']
};

/* COMBINED REDUCER */
const combinedReducer = combineReducers({
  sidebar: sidebarSlice,
  common: commonSlice,
  rootReducer: MainReducer,
  themeSetting: themeSettingSlice,
  PosSession: PosSession,
  auth: authSlice,
  // global: globalReducer,
  // categories: CategoryReduce,
  cart: checkoutSlice,
  // [api.reducerPath]: api.reducer,
  [InventoryApi.reducerPath]: InventoryApi.reducer
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

/*  LOGOUT-RESET ROOT REDUCER */
const rootReducer = (state: any, action: any) => {
  if (action.type === 'login/logout') {
    state = undefined;
  }
  return persistedReducer(state, action);
};

/* 🏗️ STORE CREATOR */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(InventoryApi.middleware),
    preloadedState: getPreloadedState(),
    devTools: true
  });

/*  LOCAL STORAGE SYNC */
const tempStore = makeStore(); // only for subscribing and initial hydration
tempStore.subscribe(() => {
  saveToLocalStorage(tempStore.getState());
});

/* TYPINGS + TYPED HOOKS */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

/* PROVIDER WRAPPER COMPONENT */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }

  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={<div>loading...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
