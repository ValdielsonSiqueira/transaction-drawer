import { useState, useEffect } from "react";
import { TransactionDrawer } from "./components/transaction-drawer";

export default function Root(props) {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const handleOpen = (event) => {
      const detail = event.detail;
      setOpen(true);
      if (detail) {
        setInitialData(detail);
        if (detail.id) {
          setEditId(detail.id);
        }
      } else {
        setInitialData(null);
        setEditId(null);
      }
    };
    window.addEventListener("@FIAP/OPEN_TRANSACTION_DRAWER", handleOpen);
    return () => {
      window.removeEventListener("@FIAP/OPEN_TRANSACTION_DRAWER", handleOpen);
    };
  }, []);

  const handleConcluir = (data) => {
    if (editId) {
      window.dispatchEvent(
        new CustomEvent("@FIAP/TRANSACTION_UPDATED", {
          detail: { id: editId, ...data },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("@FIAP/TRANSACTION_CREATED", { detail: data })
      );
    }
    setOpen(false);
    setInitialData(null);
    setEditId(null);
  };

  return (
    <section>
      <TransactionDrawer
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setInitialData(null);
            setEditId(null);
            window.dispatchEvent(
              new CustomEvent("@FIAP/CLOSE_TRANSACTION_DRAWER")
            );
          }
        }}
        title={editId ? "Editar Transação" : "Nova Transação"}
        onConcluir={handleConcluir}
        initialData={initialData}
      />
    </section>
  );
}
