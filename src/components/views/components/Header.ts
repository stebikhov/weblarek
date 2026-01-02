import { Component } from "../../base/Component.ts";
import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

interface IHeader {
  /** Количество товаров в корзине */
  goodsCount: number;
}

/**
 * Компонент шапки сайта
 *
 * Управляет отображением кнопки корзины и счётчика товаров.
 * При клике на корзину генерирует событие для открытия модального окна.
 *
 * @extends Component<IHeader>
 */
export class Header extends Component<IHeader> {
  /** Кнопка открытия корзины */
  protected basketButton: HTMLButtonElement;

  /** Элемент, отображающий количество товаров в корзине */
  protected counterElement: HTMLElement;

  /**
   * Создаёт экземпляр компонента Header
   *
   * @param events - Шина событий для межкомпонентного взаимодействия
   * @param container - Корневой DOM-элемент шапки
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Инициализируем базовый класс Component
    super(container);

    // Находим и сохраняем ссылки на DOM-элементы
    // Находим кнопку корзины внутри контейнера шапки
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".header__basket",
      this.container
    );

    // Находим элемент счётчика внутри контейнера шапки
    this.counterElement = ensureElement<HTMLElement>(
      ".header__basket-counter",
      this.container
    );

    // Настраиваем обработчики событий
    this.bindEventListeners();
  }

  /**
   * Привязывает обработчики событий к DOM-элементам
   */
  private bindEventListeners(): void {
    // При клике на кнопку корзины генерируем событие открытия
    const handleBasketClick = (): void => {
      this.events.emit("basket:open");
    };

    this.basketButton.addEventListener("click", handleBasketClick);
  }

  /**
   * Устанавливает значение счётчика товаров в корзине
   *
   * @param value - Количество товаров для отображения
   */
  set counter(value: number) {
    // Преобразуем число в строку и обновляем текстовое содержимое
    this.counterElement.textContent = value.toString();
  }
}
