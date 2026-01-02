import { categoryMap } from "../utils/constants";

export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export type TPayment = null | "card" | "cash";

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string | null;
  phone: string | null;
  address: string | null;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IOrder {
  items: string[];
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
  total: number;
}

export type TOrderResponse = {
  id: string;
  total: number;
};

export interface IErrors {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type TCard = Pick<IProduct, "title" | "price" | "id">;

export type TBasketCard = { index: number } & TCard;

export type CategoryKey = keyof typeof categoryMap;

export type TCatalogCard = Pick<IProduct, "category" | "image"> & TCard;

export type TPreviewCard = Pick<
  IProduct,
  "category" | "image" | "description"
> &
  TCard & {
    inCart?: boolean;
  };

export type TForm = {
  formElement: HTMLFormElement;
  formErrors: HTMLElement;
  nextButton: HTMLButtonElement;
  formInputs: HTMLInputElement[];
};

export type TOrderForm = {
  addressElement: HTMLInputElement;
  cashButton: HTMLButtonElement;
  cardButton: HTMLButtonElement;
} & TForm;

export type TContactsForm = {
  emailElement: HTMLInputElement;
  phoneElement: HTMLInputElement;
} & TForm;
