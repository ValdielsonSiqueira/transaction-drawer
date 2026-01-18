import { useState } from "react";
import { Button } from "@valoro/ui";
import { TransactionDrawer } from "./components/transaction-drawer";

export default function Root(props) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <Button onClick={() => setOpen(true)}>Nova Transação</Button>
      <TransactionDrawer
        open={open}
        onOpenChange={setOpen}
        title="Nova Transação"
      />
    </section>
  );
}
