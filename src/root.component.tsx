import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { TransactionDrawer } from "./components/transaction-drawer";
import { openDrawer, closeDrawer } from "./store/slices/transactionSlice";

function AppRoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOpen = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail) {
        dispatch(openDrawer({ editId: detail.id, initialData: detail }));
      } else {
        dispatch(openDrawer({}));
      }
    };

    window.addEventListener(
      "@FIAP/OPEN_TRANSACTION_DRAWER",
      handleOpen as EventListener
    );

    return () => {
      window.removeEventListener(
        "@FIAP/OPEN_TRANSACTION_DRAWER",
        handleOpen as EventListener
      );
    };
  }, [dispatch]);

  return (
    <section>
      <TransactionDrawer />
    </section>
  );
}

export default function Root(props) {
  return (
    <Provider store={store}>
      <AppRoot />
    </Provider>
  );
}
