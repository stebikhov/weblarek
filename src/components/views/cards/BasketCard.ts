import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";
import { Card } from "./Card.ts";
import { TBasketCard } from "../../../types/index.ts";
import { CardHandlers } from "./CardHandlers.ts";

/**
 * Карточка товара в корзине
 *
 * Расширяет базовую карточку, добавляя:
 * - порядковый номер товара в списке
 * - кнопку удаления из корзины
 */
export class BasketCard extends Card<TBasketCard> {
  /** Элемент для отображения порядкового номера */
  protected indexElement: HTMLElement;

  /** Кнопка удаления товара из корзины */
  protected itemDeleteButton: HTMLButtonElement;
  private handlers: CardHandlers;

  /**
   * Создаёт экземпляр карточки корзины
   *
   * @param events - Брокер событий для коммуникации с другими компонентами
   * @param container - HTML-элемент контейнера карточки
   */
  constructor(
    protected events: IEvents,
    container: HTMLElement,
    handlers: CardHandlers
  ) {
    // Вызываем конструктор родительского класса Card
    super(container);
    this.handlers = handlers;

    // Находим и сохраняем ссылки на DOM-элементы
    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container
    );

    this.itemDeleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    this.itemDeleteButton.addEventListener("click", () => {
      this.handlers.onClick();
    });
  }

  /**
   * Устанавливает порядковый номер товара в корзине
   *
   * @param value - Числовое значение индекса (начиная с 1)
   */
  set index(value: number) {
    // Преобразуем число в строку и выводим в элемент
    this.indexElement.textContent = value.toString();
  }
}
