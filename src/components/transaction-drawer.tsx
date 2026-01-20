"use client";

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  closeDrawer,
  setField,
  saveTransaction,
  setErrors,
  setTouched,
  resetForm,
} from "../store/slices/transactionSlice";
import { useIsMobile } from "../hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  DatePicker,
  MultiSelect,
  type MultiSelectOption,
} from "@valoro/ui";
import {
  CATEGORY_COLORS,
  loadCustomCategories,
  loadCustomCategoryColors,
  normalizeCategoryValue,
  CustomCategory,
} from "@FIAP/util";
import { AttachmentInput } from "./attachment-input";
import { z } from "zod";

const transactionSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  valor: z
    .string()
    .min(1, "O valor é obrigatório")
    .refine(
      (val) => {
        const numValue = parseFloat(val.replace(",", "."));
        return !isNaN(numValue) && numValue > 0;
      },
      { message: "O valor deve ser um número maior que zero" }
    ),
  tipo: z.enum(["receita", "despesa"], {
    errorMap: () => ({ message: "Selecione um tipo" }),
  }),
  categoria: z.string().min(1, "A categoria é obrigatória"),
  data: z
    .date({
      required_error: "A data é obrigatória",
      invalid_type_error: "Data inválida",
    })
    .or(
      z
        .string({ required_error: "A data é obrigatória" })
        .transform((str) => new Date(str))
    ), // Handle string date from Redux
});

export function TransactionDrawer() {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();

  const {
    isOpen,
    isEditing,
    nome,
    valor,
    tipo,
    categoria,
    categoriasSelecionadas,
    data,
    anexo,
    errors,
    touched,
    customCategoriesLoadedRef,
  } = useSelector((state: RootState) => state.transaction);

  const title = isEditing ? "Editar Transação" : "Nova Transação";

  const defaultCategories: MultiSelectOption[] = useMemo(
    () => [
      { value: "salario", label: "Salário" },
      { value: "assinaturas", label: "Assinaturas" },
      { value: "cartao-credito", label: "Cartão de Crédito" },
      { value: "comida", label: "Comida" },
      { value: "mercado", label: "Mercado" },
      { value: "financiamento", label: "Financiamento" },
      { value: "internet", label: "Internet" },
      { value: "casa", label: "Casa" },
      { value: "pensao", label: "Pensão" },
      { value: "reserva", label: "Reserva" },
      { value: "investimentos", label: "Investimentos" },
      { value: "entretenimento", label: "Entretenimento" },
      { value: "educacao", label: "Educação" },
      { value: "transferencia", label: "Transferência" },
      { value: "deposito", label: "Depósito" },
    ],
    []
  );

  const customCategories = useMemo(() => {
    return loadCustomCategories().map((cat) => ({
      value: cat.value,
      label: cat.label,
      color: cat.color,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customCategoriesLoadedRef]);

  const categoriaOptions: MultiSelectOption[] = useMemo(() => {
    return [...defaultCategories, ...customCategories];
  }, [defaultCategories, customCategories]);

  const allCategoryColors = useMemo(() => {
    const customColors = loadCustomCategoryColors();
    return { ...CATEGORY_COLORS, ...customColors };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customCategoriesLoadedRef]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeDrawer());
      window.dispatchEvent(new CustomEvent("@FIAP/CLOSE_TRANSACTION_DRAWER"));
    }
  };

  const handleCancelar = () => {
    dispatch(closeDrawer());
    window.dispatchEvent(new CustomEvent("@FIAP/CLOSE_TRANSACTION_DRAWER"));
  };

  const handleCategoriasChange = (selected: string[]) => {
    dispatch(setField({ field: "categoriasSelecionadas", value: selected }));
    const primeiraCategoria = selected.length > 0 ? selected[0] : "";

    if (!primeiraCategoria) {
      dispatch(setField({ field: "categoria", value: "" }));
      return;
    }

    let opcaoSelecionada = categoriaOptions.find(
      (opt) => opt.value === primeiraCategoria
    );

    if (!opcaoSelecionada) {
      const customCat = customCategories.find(
        (c) => c.value === primeiraCategoria
      );
      if (customCat) {
        dispatch(setField({ field: "categoria", value: customCat.label }));
      } else {
        const defaultCat = defaultCategories.find(
          (c) => c.value === primeiraCategoria
        );
        if (defaultCat) {
          dispatch(setField({ field: "categoria", value: defaultCat.label }));
        } else {
          const categoryLabel = primeiraCategoria
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          dispatch(setField({ field: "categoria", value: categoryLabel }));
        }
      }
    } else {
      dispatch(setField({ field: "categoria", value: opcaoSelecionada.label }));
    }

    dispatch(setTouched({ categoria: true }));
    if (errors.categoria) {
      const newErrors = { ...errors };
      delete newErrors.categoria;
      dispatch(setErrors(newErrors));
    }
  };

  const validateForm = (): boolean => {
    const formData = {
      nome,
      valor,
      tipo,
      categoria,
      data: data ? new Date(data) : undefined,
    };

    const result = transactionSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });

      if (categoriasSelecionadas.length === 0) {
        newErrors.categoria = "A categoria é obrigatória";
      }

      dispatch(setErrors(newErrors));
      dispatch(
        setTouched({
          nome: true,
          valor: true,
          tipo: true,
          categoria: true,
          data: true,
        })
      );
      return false;
    }

    if (categoriasSelecionadas.length === 0) {
      dispatch(
        setErrors({ ...errors, categoria: "A categoria é obrigatória" })
      );
      dispatch(setTouched({ ...touched, categoria: true }));
      return false;
    }

    return true;
  };

  const handleConcluirTransacao = () => {
    if (validateForm()) {
      dispatch(saveTransaction());
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? "Detalhes da transação"
              : "Preencha os dados da nova transação"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 pb-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome"
                  value={nome}
                  onChange={(e) => {
                    dispatch(
                      setField({ field: "nome", value: e.target.value })
                    );
                    if (touched.nome && errors.nome) {
                      const e = { ...errors };
                      delete e.nome;
                      dispatch(setErrors(e));
                    }
                  }}
                  onBlur={() => dispatch(setTouched({ nome: true }))}
                  aria-invalid={errors.nome ? true : undefined}
                />
                {(touched.nome || errors.nome) && errors.nome && (
                  <span className="text-sm text-destructive">
                    {errors.nome}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => {
                    dispatch(
                      setField({ field: "valor", value: e.target.value })
                    );
                    if (touched.valor && errors.valor) {
                      const e = { ...errors };
                      delete e.valor;
                      dispatch(setErrors(e));
                    }
                  }}
                  onBlur={() => dispatch(setTouched({ valor: true }))}
                  aria-invalid={errors.valor ? true : undefined}
                />
                {(touched.valor || errors.valor) && errors.valor && (
                  <span className="text-sm text-destructive">
                    {errors.valor}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <DatePicker
                value={data ? new Date(data) : undefined}
                onValueChange={(value) => {
                  dispatch(
                    setField({
                      field: "data",
                      value: value ? value.toISOString() : undefined,
                    })
                  );
                  if (touched.data && errors.data) {
                    const e = { ...errors };
                    delete e.data;
                    dispatch(setErrors(e));
                  }
                  dispatch(setTouched({ data: true }));
                }}
                label="Data"
                placeholder="Selecione a data"
                buttonClassName={`w-full justify-between font-normal ${
                  (touched.data || errors.data) && errors.data
                    ? "!border-destructive"
                    : ""
                }`}
              />
              {(touched.data || errors.data) && errors.data && (
                <span className="text-sm text-destructive">{errors.data}</span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="categoria">Categoria</Label>
              <MultiSelect
                options={categoriaOptions}
                selected={categoriasSelecionadas}
                onSelectedChange={handleCategoriasChange}
                placeholder="Selecione uma opção ou crie uma..."
                searchPlaceholder="Buscar..."
                className={
                  (touched.categoria || errors.categoria) && errors.categoria
                    ? "!border-destructive"
                    : ""
                }
                singleSelect={true}
                colorMap={allCategoryColors}
                defaultOptions={customCategories}
              />
              {(touched.categoria || errors.categoria) && errors.categoria && (
                <span className="text-sm text-destructive">
                  {errors.categoria}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(value) => {
                  dispatch(setField({ field: "tipo", value: value }));
                  dispatch(setTouched({ tipo: true }));
                  if (touched.tipo && errors.tipo) {
                    const e = { ...errors };
                    delete e.tipo;
                    dispatch(setErrors(e));
                  }
                }}
              >
                <SelectTrigger
                  className={`w-full ${
                    (touched.tipo || errors.tipo) && errors.tipo
                      ? "!border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
              {(touched.tipo || errors.tipo) && errors.tipo && (
                <span className="text-sm text-destructive">{errors.tipo}</span>
              )}
            </div>

            <AttachmentInput
              value={anexo}
              onChange={(file) =>
                dispatch(setField({ field: "anexo", value: file }))
              }
            />
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleConcluirTransacao}>
            {isEditing ? "Salvar" : "Concluir transação"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleCancelar}>
              {isEditing ? "Fechar" : "Cancelar"}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
