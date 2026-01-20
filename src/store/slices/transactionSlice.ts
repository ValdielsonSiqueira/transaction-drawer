import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addCustomCategory,
  loadCustomCategories,
  saveCustomCategories,
  saveCustomCategoryColor,
  loadCustomCategoryColors,
  normalizeCategoryValue,
  CustomCategory,
  CATEGORY_COLORS,
} from "@FIAP/util";

export interface TransactionState {
  isOpen: boolean;
  isEditing: boolean;
  editId: number | null;

  nome: string;
  valor: string;
  tipo: string;
  categoria: string;
  categoriasSelecionadas: string[];
  data: string | undefined;
  anexo: File | string | null;

  errors: Record<string, string>;
  touched: Record<string, boolean>;

  isLoading: boolean;
  customCategoriesLoadedRef: number;
}

const initialState: TransactionState = {
  isOpen: false,
  isEditing: false,
  editId: null,
  nome: "",
  valor: "",
  tipo: "",
  categoria: "",
  categoriasSelecionadas: [],
  data: undefined,
  anexo: null,
  errors: {},
  touched: {},
  isLoading: false,
  customCategoriesLoadedRef: 0,
};

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const DEFAULT_COLORS = [
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-lime-500",
  "bg-amber-500",
  "bg-red-600",
  "bg-blue-600",
  "bg-purple-600",
  "bg-pink-600",
];

const DEFAULT_CATEGORIES = [
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
];

const getCategoryColorForLabel = (label: string): string | undefined => {
  const allCategoryColors = {
    ...CATEGORY_COLORS,
    ...loadCustomCategoryColors(),
  };
  if (allCategoryColors[label]) {
    return allCategoryColors[label];
  }

  const customCat = loadCustomCategories().find(
    (cat) => cat.label.toLowerCase() === label.toLowerCase()
  );
  if (customCat?.color) {
    return customCat.color;
  }

  const hash = label
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedColor = DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
  return selectedColor;
};

export const saveTransaction = createAsyncThunk(
  "transaction/save",
  async (_, { getState, dispatch }) => {
    const state = (getState() as any).transaction as TransactionState;
    const { nome, valor, tipo, categoria, data, anexo, editId, isEditing } =
      state;

    const categoriaFinal = categoria.trim();
    if (categoriaFinal) {
      const customCats = loadCustomCategories();
      const existingCustom = customCats.find(
        (c) => c.label.toLowerCase() === categoriaFinal.toLowerCase()
      );

      const normalized = normalizeCategoryValue(categoriaFinal);

      if (!existingCustom) {
        const isDefaultKey =
          Object.keys(CATEGORY_COLORS).includes(categoriaFinal);

        if (!isDefaultKey) {
          const color = getCategoryColorForLabel(categoriaFinal);
          const newCat: CustomCategory = {
            value: normalized,
            label: categoriaFinal,
            color: color,
          };
          addCustomCategory(newCat);
          if (color) {
            saveCustomCategoryColor(categoriaFinal, color);
          }
          dispatch(transactionSlice.actions.incrementCustomCategoriesLoaded());
        }
      } else {
        const color = getCategoryColorForLabel(categoriaFinal);
        if (color && existingCustom.color !== color) {
          saveCustomCategoryColor(categoriaFinal, color);
          const updated = customCats.map((c) =>
            c.label.toLowerCase() === categoriaFinal.toLowerCase()
              ? { ...c, color }
              : c
          );
          saveCustomCategories(updated);
          dispatch(transactionSlice.actions.incrementCustomCategoriesLoaded());
        }
      }
    }

    let anexoProcessed: string | null | undefined = null;
    if (anexo instanceof File) {
      try {
        anexoProcessed = await fileToDataURL(anexo);
      } catch (error) {
        console.error("Erro ao converter anexo:", error);
      }
    } else {
      anexoProcessed = anexo as string | null;
    }

    const payload = {
      id: editId ?? undefined,
      nome: nome.trim(),
      valor: valor.trim(),
      tipo,
      categoria: categoriaFinal,
      data: data ? new Date(data) : undefined,
      attachment: anexoProcessed,
    };

    const eventName = isEditing
      ? "@FIAP/TRANSACTION_UPDATED"
      : "@FIAP/TRANSACTION_CREATED";
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));

    return true;
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    openDrawer: (
      state,
      action: PayloadAction<{ editId?: number; initialData?: any }>
    ) => {
      state.isOpen = true;
      state.errors = {};
      state.touched = {};

      if (action.payload.editId && action.payload.initialData) {
        const d = action.payload.initialData;
        state.isEditing = true;
        state.editId = action.payload.editId;
        state.nome = d.nome || "";
        state.valor = d.valor || "";
        state.tipo = d.tipo ? d.tipo.toLowerCase() : "";

        // Logic to set categoria and categoriasSelecionadas (value vs label)
        const categoriaLabel = d.categoria || "";
        state.categoria = categoriaLabel;

        if (categoriaLabel) {
          const customCats = loadCustomCategories();
          const allCats = [...DEFAULT_CATEGORIES, ...customCats];

          const found = allCats.find(
            (c) => c.label.toLowerCase() === categoriaLabel.toLowerCase()
          );
          if (found) {
            state.categoriasSelecionadas = [found.value];
          } else {
            const normalized = normalizeCategoryValue(categoriaLabel);
            state.categoriasSelecionadas = [normalized];
          }
        } else {
          state.categoriasSelecionadas = [];
        }

        state.data = d.data
          ? d.data instanceof Date
            ? d.data.toISOString()
            : d.data
          : undefined;
        state.anexo = d.attachment || null;
      } else {
        state.isEditing = false;
        state.editId = null;
        state.nome = "";
        state.valor = "";
        state.tipo = "";
        state.categoria = "";
        state.categoriasSelecionadas = [];
        state.data = undefined;
        state.anexo = null;
      }
    },
    closeDrawer: (state) => {
      state.isOpen = false;
    },
    setField: (
      state,
      action: PayloadAction<{ field: keyof TransactionState; value: any }>
    ) => {
      (state as any)[action.payload.field] = action.payload.value;
    },
    setErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.errors = action.payload;
    },
    setTouched: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.touched = { ...state.touched, ...action.payload };
    },
    resetForm: (state) => {
      Object.assign(state, initialState);
    },
    incrementCustomCategoriesLoaded: (state) => {
      state.customCategoriesLoadedRef += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveTransaction.fulfilled, (state) => {
      state.isOpen = false;
    });
  },
});

export const {
  openDrawer,
  closeDrawer,
  setField,
  setErrors,
  setTouched,
  resetForm,
} = transactionSlice.actions;
export default transactionSlice.reducer;
