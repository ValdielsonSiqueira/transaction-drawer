import { useState, useEffect } from "react";
import { TransactionDrawer } from "./components/transaction-drawer";

export default function Root(props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("@FIAP/OPEN_TRANSACTION_DRAWER", handleOpen);
    return () => {
      window.removeEventListener("@FIAP/OPEN_TRANSACTION_DRAWER", handleOpen);
    };
  }, []);

  const handleConcluir = (data) => {
    window.dispatchEvent(
      new CustomEvent("@FIAP/TRANSACTION_CREATED", { detail: data })
    );
    setOpen(false);
  };

  return (
    <section>
      <TransactionDrawer
        open={open}
        onOpenChange={setOpen}
        title="Nova Transação"
        onConcluir={handleConcluir}
      />
    </section>
  );
}
