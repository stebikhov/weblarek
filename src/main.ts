import "./scss/styles.scss";

// === Типы и константы ===
import type { IErrors, IOrder, TPayment } from "./types/index.ts";
import { API_URL } from "./utils/constants";
import { ensureElement, cloneTemplate } from "./utils/utils.ts";

// === Инфратруктура приложения ===
import { EventEmitter } from "./components/base/Events.ts"; // Шина событий
import { Api } from "./components/base/Api.ts"; // Базовый API
import ApiClient from "./components/api/ApiClient.ts"; // HTTP-клиент

// === Домен ===
import { ProductCatalog } from "./components/models/ProductCatalog.ts"; // Каталог товаров
import { ShoppingCart } from "./components/models/ShoppingCart.ts"; // Корзина
import { Buyer } from "./components/models/Buyer.ts"; // Покупатель

// === Представление ===
import { Header } from "./components/views/components/Header.ts"; // Шапка
import { Gallery } from "./components/views/components/Gallery.ts"; // Галерея товаров
import { Modal } from "./components/views/components/Modal.ts"; // Модальное окно
import { Basket } from "./components/views/components/Basket.ts"; // Корзина в модалке
import { Ordered } from "./components/views/components/Ordered.ts"; // Экран успеха
import { BasketCard } from "./components/views/cards/BasketCard.ts"; // Карточка в корзине
import { CatalogCard } from "./components/views/cards/CatalogCard.ts"; // Карточка каталога
import { PreviewCard } from "./components/views/cards/PreviewCard.ts"; // Полная карточка товара
import { OrderForm } from "./components/views/forms/OrderForm.ts"; // Форма заказа
import { ContactsForm } from "./components/views/forms/ContactsForm.ts"; // Форма контактов

// ═══════════════════════════════════════════════════════════════
//                    КОНСТАНТЫ И ТИПЫ
// ═══════════════════════════════════════════════════════════════

const enum Selectors {
  HEADER = ".header", // Селектор шапки сайта
  GALLERY = ".gallery", // Селектор контейнера с товарами
  MODAL = ".modal", // Селектор модального окна
}

const enum Templates {
  SUCCESS = "#success", // Шаблон экрана успешного заказа
  CARD_CATALOG = "#card-catalog", // Шаблон карточки каталога
  CARD_PREVIEW = "#card-preview", // Шаблон подробной карточки товара
  CARD_BASKET = "#card-basket", // Шаблон карточки в корзине
  BASKET = "#basket", // Шаблон корзины
  ORDER = "#order", // Шаблон формы заказа
  CONTACTS = "#contacts", // Шаблон формы контактов
}

// Названия полей форм для типизации
type FormFieldName = "payment" | "address" | "email" | "phone";

// Интерфейс события изменения поля формы
interface FieldChangePayload {
  field: FormFieldName;
  value: string;
}

// Интерфейс события действия с карточкой
interface CardActionPayload {
  card: string; // ID товара
}

// ═══════════════════════════════════════════════════════════════
//                    ГЛОБАЛЬНЫЕ ЭКЗЕМПЛЯРЫ
// ═══════════════════════════════════════════════════════════════

// Инфраструктура
const bus = new EventEmitter();
const httpClient = new ApiClient(new Api(API_URL));

// Модели (домен)
const catalog = new ProductCatalog();
const cart = new ShoppingCart();
const customer = new Buyer();

// Шаблоны
const templates = {
  success: ensureElement<HTMLTemplateElement>(Templates.SUCCESS),
  cardCatalog: ensureElement<HTMLTemplateElement>(Templates.CARD_CATALOG),
  cardPreview: ensureElement<HTMLTemplateElement>(Templates.CARD_PREVIEW),
  cardBasket: ensureElement<HTMLTemplateElement>(Templates.CARD_BASKET),
  basket: ensureElement<HTMLTemplateElement>(Templates.BASKET),
  order: ensureElement<HTMLTemplateElement>(Templates.ORDER),
  contacts: ensureElement<HTMLTemplateElement>(Templates.CONTACTS),
};

// UI компоненты
const header = new Header(bus, ensureElement<HTMLElement>(Selectors.HEADER));
const gallery = new Gallery(ensureElement<HTMLElement>(Selectors.GALLERY));
const modal = new Modal(bus, ensureElement<HTMLElement>(Selectors.MODAL));
const basket = new Basket(bus, cloneTemplate(templates.basket));
const orderForm = new OrderForm(bus, cloneTemplate(templates.order));
const contactsForm = new ContactsForm(bus, cloneTemplate(templates.contacts));
const successScreen = new Ordered(bus, cloneTemplate(templates.success));
const preview = new PreviewCard(bus, cloneTemplate(templates.cardPreview));

preview.addButtonHandler(() => {
  // Если цена не установлена, ничего не делаем
  if (catalog.getSelectedProduct()?.price === null) {
    return;
  }

  const selectedProduct = catalog.getSelectedProduct();
  // В зависимости от состояния генерируем соответствующее событие
  if (cart.hasItem(selectedProduct?.id)) {
    // Товар уже в корзине - запрашиваем удаление
    bus.emit("card:delete", { card: selectedProduct?.id });
  } else {
    // Товара нет в корзине - запрашиваем добавление
    bus.emit("card:add", { card: selectedProduct?.id });
  }
});

// Фабрики карточек
const createCatalogCard = (id: string, bus: EventEmitter) => {
  return new CatalogCard(bus, cloneTemplate(templates.cardCatalog), {
    onClick: () => {
      bus.emit("card:select", { card: id });
    },
  });
};

const createBasketCard = (id: string) => {
  return new BasketCard(bus, cloneTemplate(templates.cardBasket), {
    onClick: () => {
      bus.emit("card:delete", { card: id });
    },
  });
};

// ═══════════════════════════════════════════════════════════════
//                    ФУНКЦИИ ОТОБРАЖЕНИЯ
// ═══════════════════════════════════════════════════════════════

/**
 * Строит и отображает каталог товаров в галерее
 */
const buildCatalogView = (): void => {
  const cardElements = catalog.getProducts().map((product) => {
    const { id, title, image, category, price } = product;
    const cardView = createCatalogCard(id, bus);

    return cardView.render({ id, title, image, category, price });
  });

  gallery.render({ catalog: cardElements });
};

/**
 * Строит и отображает содержимое корзины в модальном окне
 */
const buildBasketView = (): void => {
  const cartItems = cart.getItems();

  const renderedItems = cartItems.map((product, idx) => {
    const cardView = createBasketCard(product.id);
    cardView.index = idx + 1;
    return cardView.render(product);
  });

  Object.assign(basket, {
    items: renderedItems,
    total: cart.getTotalPrice(),
  });
};

/**
 * Синхронизирует состояние кнопки "В корзину" в превью товара
 */
const syncPreviewButtonState = (): void => {
  const product = catalog.getSelectedProduct();
  if (product?.id) {
    preview.inCart = cart.hasItem(product?.id);
  }
};

/**
 * Открытие карточки товара
 */
const showCard = (): void => {
  const product = catalog.getSelectedProduct();
  if (product) {
    const content = preview.render({
      ...product,
      inCart: cart.hasItem(product.id),
    });

    modal.open(content);
  }
};

/**
 * Выбор карточки товара
 */
const selectCard = ({ card: productId }: CardActionPayload) => {
  const product = catalog.getProductById(productId);
  if (!product) return;

  catalog.selectProduct(productId);
};

// ═══════════════════════════════════════════════════════════════
//                    ОБРАБОТЧИКИ СОБЫТИЙ
// ═══════════════════════════════════════════════════════════════

/**
 * Настройка событий для работы с каталогом товаров
 */
const setupCatalogEvents = (): void => {
  // При изменении каталога пересобираем галерею
  catalog.on("catalog:changed", buildCatalogView);
  // Обработка открыти карточки товара
  catalog.on("product:selected", showCard);
  // Выбор карточки товара
  bus.on("card:select", selectCard);

  // Добавление товара в корзину
  bus.on("card:add", ({ card: productId }: CardActionPayload) => {
    const product = catalog.getProductById(productId);
    const canBeAdded = product && product.price !== null;
    if (canBeAdded) cart.addItem(product);
  });

  // Удаление товара из корзины
  bus.on("card:delete", ({ card: productId }: CardActionPayload) => {
    const product = catalog.getProductById(productId);
    product && cart.removeItemById(product.id);
  });
};

/**
 * Настройка событий для работы с корзиной
 */
const setupCartEvents = (): void => {
  // При любом изменении корзины обновляем счетчик и содержимое
  cart.on("basket:changed", () => {
    header.counter = cart.getItemCount();
    buildBasketView();
    syncPreviewButtonState();
  });

  // Открытие корзины
  bus.on("basket:open", () => {
    const content = basket.render();
    modal.open(content);
  });

  // Переход к оформлению заказа
  bus.on("basket:ready", () => {
    customer.clear();
    const { payment, address } = customer.getData();
    orderForm.payment = payment;
    orderForm.addressValue = address;

    modal.open(orderForm.render());
  });
};

/**
 * Настройка событий для оформления заказа
 */
const setupCheckoutEvents = (): void => {
  // Маппинг полей формы на методы модели Buyer
const fieldSetters: Record<FormFieldName, (val: string) => void> = {
  payment: (v) => customer.update({ payment: v as TPayment }),
  address: (v) => customer.update({ address: v }),
  email: (v) => customer.update({ email: v }),
  phone: (v) => customer.update({ phone: v })
};

  // Показ ошибок валидации в формах
  customer.on("form:errors", (errors: IErrors) => {
    orderForm.validateForm(errors);
    contactsForm.validateForm(errors);
  });

  // Изменение полей формы заказа
  bus.on("order:change", ({ field, value }: FieldChangePayload) => {
    fieldSetters[field]?.(value);
  });

  // Переход к форме контактов
  bus.on("order:next", () => {
    const { email, phone } = customer.getData();
    contactsForm.emailValue = email;
    contactsForm.phoneValue = phone;
    modal.content = contactsForm.render();
  });

  // Отправка заказа на сервер
  bus.on("contacts:submit", async () => {
    const customerInfo = customer.getData();

    const orderPayload: IOrder = {
      ...customerInfo,
      email: customerInfo.email ?? "",
      phone: customerInfo.phone ?? "",
      address: customerInfo.address ?? "",
      total: cart.getTotalPrice(),
      items: cart.getItems().map((p) => p.id),
    };

    try {
      const orderResponse = await httpClient.sendOrder(orderPayload);

      // Проверяем, что ответ содержит поле total
      if (typeof orderResponse.total === "number") {
        successScreen.total = orderResponse.total;
      } else {
        console.warn("Сервер не вернул поле total");
      }

      cart.clear();
      customer.clear();

      modal.content = successScreen.render();
    } catch (err) {
      console.error("Не удалось оформить заказ:", err);
    }
  });

  // Закрытие экрана успеха
  bus.on("success:closed", () => {
    cart.clear();
    modal.close();
  });
};

// ═══════════════════════════════════════════════════════════════
//                    ТОЧКА ВХОДА В ПРИЛОЖЕНИЕ
// ═══════════════════════════════════════════════════════════════

(async function main() {
  // Подключаем все обработчики событий
  setupCatalogEvents();
  setupCartEvents();
  setupCheckoutEvents();

  // Загружаем начальные данные (каталог товаров)
  try {
    const products = await httpClient.getCatalog();
    catalog.setProducts(products); // Обновляем каталог → триггерит перерисовку
  } catch (err) {
    console.error("Не удалось загрузить каталог:", err);
  }
})();
