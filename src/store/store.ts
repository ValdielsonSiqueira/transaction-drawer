import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "./slices/transactionSlice";

export const store = configureStore({
  reducer: {
    transaction: transactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
