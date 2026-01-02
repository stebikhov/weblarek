import { Component } from "../../base/Component.ts";
import { ensureElement } from "../../../utils/utils.ts";
import { TCard } from "../../../types/index.ts";

/**
 * Базовый компонент карточки товара
 *
 * Отображает основную информацию о товаре: название и цену.
 * Служит родительским классом для более специализированных карточек.
 *
 * @template T - Дополнительные поля данных карточки
 */
export class Card<T = {}> extends Component<TCard & T> {
  /** Элемент для отображения названия товара */
  protected titleElement: HTMLElement;

  /** Элемент для отображения цены товара */
  protected priceElement: HTMLElement;
  private _id: string = "";

  /**
   * Создаёт экземпляр карточки
   *
   * @param container - Корневой DOM-элемент карточки
   */
  constructor(container: HTMLElement) {
    // Вызываем конструктор родительского класса Component
    super(container);

    // Находим и сохраняем ссылки на DOM-элементы внутри контейнера
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
  }

  /**
   * Возвращает идентификатор карточки
   */
  get id(): string {
    return this._id;
  }

  /**
   * Устанавливает идентификатор карточки
   *
   * Синхронизирует значение с атрибутом id контейнера
   * для возможности поиска элемента в DOM.
   *
   * @param value - Новый идентификатор
   */
  set id(value: string) {
    // Сохраняем значение в свойство класса
    this._id = value;

    // Дублируем в атрибут id контейнера
    this.container.id = value;
  }

  /**
   * Устанавливает название товара
   *
   * @param value - Текст названия
   */
  set title(value: string) {
    // Обновляем текстовое содержимое элемента заголовка
    this.titleElement.textContent = value;
  }

  /**
   * Устанавливает цену товара
   *
   * Если цена равна null, отображается текст "Бесценно".
   * Иначе — числовое значение с единицей измерения.
   *
   * @param value - Цена в синапсах или null для бесценных товаров
   */
  set price(value: number | null) {
    // Проверяем, задана ли цена
    const hasPrice = value !== null;

    // Формируем текст в зависимости от наличия цены
    if (hasPrice) {
      this.priceElement.textContent = `${value} синапсов`;
    } else {
      this.priceElement.textContent = "Бесценно";
    }
  }
}
