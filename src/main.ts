import "./scss/styles.scss";

// === Типы и константы ===
import type { IOrder, TPayment } from "./types/index.ts";
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

// Ошибки валидации формы
interface ValidationErrors {
  [key: string]: string | undefined;
}

// ═══════════════════════════════════════════════════════════════
//                    КОНТЕЙНЕР ПРИЛОЖЕНИЯ (DI)
// ═══════════════════════════════════════════════════════════════

/**
 * Singleton-контейнер, который содержит все зависимости приложения.
 * Реализует паттерн Dependency Injection через единый доступный экземпляр.
 */
class AppContainer {
  private static _instance: AppContainer;

  // Глобальная шина событий для коммуникации между компонентами
  readonly bus = new EventEmitter();

  // HTTP клиент для работы с API
  readonly httpClient = new ApiClient(new Api(API_URL));

  // Домен (бизнес-модели)
  readonly catalog = new ProductCatalog(); // Каталог товаров
  readonly cart = new ShoppingCart(); // Корзина покупок
  readonly customer = new Buyer(); // Данные покупателя

  // Шаблоны HTML для клонирования
  private readonly _templates = {
    success: ensureElement<HTMLTemplateElement>(Templates.SUCCESS),
    cardCatalog: ensureElement<HTMLTemplateElement>(Templates.CARD_CATALOG),
    cardPreview: ensureElement<HTMLTemplateElement>(Templates.CARD_PREVIEW),
    cardBasket: ensureElement<HTMLTemplateElement>(Templates.CARD_BASKET),
    basket: ensureElement<HTMLTemplateElement>(Templates.BASKET),
    order: ensureElement<HTMLTemplateElement>(Templates.ORDER),
    contacts: ensureElement<HTMLTemplateElement>(Templates.CONTACTS),
  };

  // UI компоненты (представление)
  readonly ui = {
    header: new Header(this.bus, ensureElement<HTMLElement>(Selectors.HEADER)),
    gallery: new Gallery(ensureElement<HTMLElement>(Selectors.GALLERY)),
    modal: new Modal(this.bus, ensureElement<HTMLElement>(Selectors.MODAL)),

    // Экраны модального окна
    basket: new Basket(this.bus, cloneTemplate(this._templates.basket)),
    orderForm: new OrderForm(this.bus, cloneTemplate(this._templates.order)),
    contactsForm: new ContactsForm(
      this.bus,
      cloneTemplate(this._templates.contacts)
    ),
    successScreen: new Ordered(
      this.bus,
      cloneTemplate(this._templates.success)
    ),

    // Карточки товаров
    preview: new PreviewCard(
      this.bus,
      cloneTemplate(this._templates.cardPreview)
    ),
  };

  /** Получить единственный экземпляр контейнера */
  static getInstance(): AppContainer {
    return (this._instance ??= new AppContainer());
  }

  /** Фабрика карточек каталога */
  createCatalogCard = () =>
    new CatalogCard(this.bus, cloneTemplate(this._templates.cardCatalog));

  /** Фабрика карточек корзины */
  createBasketCard = () =>
    new BasketCard(this.bus, cloneTemplate(this._templates.cardBasket));
}

// ═══════════════════════════════════════════════════════════════
//                    ФУНКЦИИ ОТОБРАЖЕНИЯ
// ═══════════════════════════════════════════════════════════════

/**
 * Строит и отображает каталог товаров в галерее
 */
const buildCatalogView = (container: AppContainer): void => {
  const { catalog, ui, createCatalogCard } = container;

  const cardElements = catalog.getProducts().map((product) => {
    const cardView = createCatalogCard();
    const { id, title, image, category, price } = product;
    return cardView.render({ id, title, image, category, price });
  });

  ui.gallery.render({ catalog: cardElements });
};

/**
 * Строит и отображает содержимое корзины в модальном окне
 */
const buildBasketView = (container: AppContainer): void => {
  const { cart, ui, createBasketCard } = container;
  const cartItems = cart.getItems();

  // Создаем карточки для каждого товара в корзине
  const renderedItems = cartItems.map((product, idx) => {
    const cardView = createBasketCard();
    cardView.index = idx + 1; // Номер позиции в корзине
    return cardView.render(product);
  });

  // Обновляем данные экрана корзины
  Object.assign(ui.basket, {
    items: renderedItems,
    total: cart.getTotalPrice(),
  });
};

/**
 * Синхронизирует состояние кнопки "В корзину" в превью товара
 */
const syncPreviewButtonState = (container: AppContainer): void => {
  const { cart, ui } = container;
  const currentProductId = ui.preview.id;

  if (currentProductId) {
    // Показываем состояние "Уже в корзине" если товар добавлен
    ui.preview.inCart = cart.hasItem(currentProductId);
  }
};

// ═══════════════════════════════════════════════════════════════
//                    ОБРАБОТЧИКИ СОБЫТИЙ
// ═══════════════════════════════════════════════════════════════

/**
 * Настройка событий для работы с каталогом товаров
 */
const setupCatalogEvents = (ctx: AppContainer): void => {
  const { bus, catalog, cart, ui } = ctx;

  // При изменении каталога пересобираем галерею
  catalog.on("catalog:changed", () => buildCatalogView(ctx));

  // Открытие подробной карточки товара
  bus.on("card:open", ({ card: productId }: CardActionPayload) => {
    const product = catalog.getProductById(productId);
    if (!product) return;

    const hasPriceTag = product.price !== null; // Есть ли цена у товара

    // Отображаем подробную информацию о товаре
    ui.preview.render({
      ...product,
      inCart: cart.hasItem(product.id),
    });

    // Показываем модалку с товаром
    ui.modal.content = ui.preview.render({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      inCart: cart.hasItem(product.id),
    });
    ui.modal.open();

    // Блокируем кнопку если нет цены
    if (!hasPriceTag) ui.preview.disableButton();
  });

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
const setupCartEvents = (ctx: AppContainer): void => {
  const { bus, cart, customer, ui } = ctx;

  // При любом изменении корзины обновляем счетчик и содержимое
  cart.on("basket:changed", () => {
    ui.header.counter = cart.getItemCount(); // Счетчик в хедере
    buildBasketView(ctx); // Корзина в модалке
    syncPreviewButtonState(ctx); // Кнопка в превью
  });

  // Открытие корзины
  bus.on("basket:open", () => {
    buildBasketView(ctx);
    ui.modal.content = ui.basket.render();
    ui.modal.open();
  });

  // Переход к оформлению заказа (корзина готова)
  bus.on("basket:ready", () => {
    const hasItems = cart.getItemCount() > 0;
    if (!hasItems) return; // Корзина пуста - выходим

    // Очищаем данные покупателя и заполняем форму
    customer.clear();
    const { payment, address } = customer.getData();
    ui.orderForm.payment = payment;
    ui.orderForm.addressValue = address;

    ui.modal.content = ui.orderForm.render();
    ui.modal.open();
  });
};

/**
 * Настройка событий для оформления заказа
 */
const setupCheckoutEvents = (ctx: AppContainer): void => {
  const { bus, cart, customer, ui, httpClient } = ctx;

  // Маппинг полей формы на методы модели Buyer
  const fieldSetters: Record<FormFieldName, (val: string) => void> = {
    payment: (v) => customer.setField("payment", v as TPayment), // Способ оплаты
    address: (v) => customer.setField("address", v), // Адрес доставки
    email: (v) => customer.setField("email", v), // Email
    phone: (v) => customer.setField("phone", v), // Телефон
  };

  // Показ ошибок валидации в формах
  customer.on("form:errors", (errors: ValidationErrors) => {
    ui.orderForm.validateForm(errors);
    ui.contactsForm.validateForm(errors);
  });

  // Изменение полей формы заказа
  bus.on("order:change", ({ field, value }: FieldChangePayload) => {
    fieldSetters[field]?.(value);
  });

  // Переход к форме контактов
  bus.on("order:next", () => {
    const { email, phone } = customer.getData();
    ui.contactsForm.emailValue = email; // Предзаполняем email
    ui.contactsForm.phoneValue = phone; // Предзаполняем телефон
    ui.modal.content = ui.contactsForm.render();
  });

  // Отправка заказа на сервер
  bus.on("contacts:submit", async () => {
    const customerInfo = customer.getData();

    // Формируем данные заказа для API
    const orderPayload: IOrder = {
      ...customerInfo,
      email: customerInfo.email ?? "",
      phone: customerInfo.phone ?? "",
      address: customerInfo.address ?? "",
      total: cart.getTotalPrice(), // Итоговая сумма
      items: cart.getItems().map((p) => p.id), // Список ID товаров
    };

    try {
      // Отправляем заказ
      await httpClient.sendOrder(orderPayload);

      // Очищаем состояние после успешного заказа
      cart.clear();
      customer.clear();

      // Показываем экран успеха
      ui.successScreen.total = orderPayload.total;
      ui.modal.content = ui.successScreen.render();
    } catch (err) {
      console.error("Не удалось оформить заказ:", err);
    }
  });

  // Закрытие экрана успеха
  bus.on("success:closed", () => {
    cart.clear(); // Очищаем корзину
    ui.modal.close(); // Закрываем модалку
  });
};

// ═══════════════════════════════════════════════════════════════
//                    ТОЧКА ВХОДА В ПРИЛОЖЕНИЕ
// ═══════════════════════════════════════════════════════════════

/**
 * Главная функция инициализации приложения
 */
(async function main() {
  const app = AppContainer.getInstance();

  // Подключаем все обработчики событий
  [setupCatalogEvents, setupCartEvents, setupCheckoutEvents].forEach((setup) =>
    setup(app)
  );

  // Загружаем начальные данные (каталог товаров)
  try {
    const products = await app.httpClient.getCatalog();
    app.catalog.setProducts(products); // Обновляем каталог → триггерит перерисовку
  } catch (err) {
    console.error("Не удалось загрузить каталог:", err);
  }
})();
