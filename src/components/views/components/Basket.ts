import { Component } from "../../base/Component.ts";
import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

/**
 * Интерфейс данных корзины
 * Описывает структуру состояния, которым управляет компонент Basket
 */
interface IBasket {
  /** Массив HTML-элементов карточек товаров в корзине */
  items: HTMLElement[];
}

/**
 * Компонент корзины покупок
 *
 * Отвечает за отображение списка добавленных товаров,
 * общей стоимости и управление состоянием кнопки оформления заказа.
 *
 * @extends Component<IBasket>
 */
export class Basket extends Component<IBasket> {
  protected listElements: HTMLElement;
  protected priceElements: HTMLElement;
  protected basketButton: HTMLButtonElement;

  /**
   * Создаёт экземпляр компонента корзины
   *
   * @param events - Брокер событий для коммуникации с другими компонентами
   * @param container - Корневой DOM-элемент корзины
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Component
    super(container);

    // Находим и сохраняем ссылки на DOM-элементы внутри контейнера корзины

    // Находим контейнер списка товаров
    this.listElements = ensureElement<HTMLElement>(
      ".basket__list",
      this.container
    );

    // Находим элемент для отображения общей стоимости
    this.priceElements = ensureElement<HTMLElement>(
      ".basket__price",
      this.container
    );

    // Находим кнопку оформления заказа
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );

    // Вешаем обработчик клика на кнопку оформления
    // При клике генерируем событие готовности корзины к оформлению
    this.basketButton.addEventListener("click", () => {
      this.events.emit("basket:ready");
    });

    //Деактивируем кнопку "Оформить" для пустой корзины
    this.items = [];
  }

  /**
   * Устанавливает список товаров в корзине
   *
   * Обновляет содержимое списка, управляет CSS-классами
   * для стилизации пустого состояния и прокрутки,
   * а также блокирует/разблокирует кнопку оформления.
   *
   * @param nodes - Массив HTML-элементов карточек товаров
   */
  set items(nodes: HTMLElement[]) {
    // Определяем, пуста ли корзина
    const isEmpty = nodes.length === 0;

    // Обновляем содержимое списка товаров
    this.updateContent(nodes, isEmpty);

    // Блокируем кнопку оформления, если корзина пуста
    this.basketButton.disabled = isEmpty;
  }

  /**
   * Устанавливает отображаемую общую стоимость товаров
   *
   * @param value - Числовое значение общей стоимости
   */
  set total(value: number) {
    // Форматируем и отображаем стоимость с единицей измерения
    this.priceElements.textContent = `${value} синапсов`;
  }

  /**
   * Обновляет содержимое списка товаров
   *
   * Если корзина пуста — показывает заглушку.
   * Если есть товары — заменяет содержимое переданными элементами.
   *
   * @param nodes - Массив HTML-элементов для отображения
   * @param empty - Флаг пустой корзины
   */
  private updateContent(nodes: HTMLElement[], empty: boolean): void {
    if (empty) {
      // Корзина пуста — контейнер нужно очистить
      this.listElements.replaceChildren();
    } else {
      // Есть товары — заменяем все дочерние элементы на новые
      // replaceChildren эффективнее innerHTML для массива элементов
      this.listElements.replaceChildren(...nodes);
    }
  }

  /**
   * Устанавливает состояние доступности кнопки "Оформить".
   * @param disabled - true для блокировки кнопки, false для активации
   */
  disableCheckoutButton(disabled: boolean): void {
    this.basketButton.disabled = disabled;
  }
}
