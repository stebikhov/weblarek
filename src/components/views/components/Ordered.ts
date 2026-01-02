import { Component } from "../../base/Component.ts";
import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

/**
 * Интерфейс, описывающий данные успешного заказа
 * @property total - итоговая сумма списанных синапсов
 */
interface IOrdered {
  totalWithdrawn: number;
}

/**
 * Класс для отображения экрана успешного оформления заказа
 * Наследуется от базового Component с типизацией ISuccessfulOrder
 */
export class Ordered extends Component<IOrdered> {
  /** Элемент заголовка успешного заказа */
  protected titleElement: HTMLElement;

  /** Элемент описания с информацией о списанной сумме */
  protected descriptionElement: HTMLElement;

  /** Кнопка закрытия окна успешного заказа */
  protected closeButton: HTMLButtonElement;

  /**
   * Создаёт экземпляр компонента успешного заказа
   * @param events - система событий для коммуникации между компонентами
   * @param container - корневой HTML-элемент компонента
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Component
    super(container);

    // Инициализируем DOM-элементы
    // Находим элемент заголовка внутри контейнера
    this.titleElement = ensureElement<HTMLElement>(
      ".order-success__title",
      this.container
    );

    // Находим элемент описания внутри контейнера
    this.descriptionElement = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container
    );

    // Находим кнопку закрытия внутри контейнера
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container
    );

    // Привязываем обработчики событий
    this._bindEventListeners();
  }

  /**
   * Привязывает обработчики событий к DOM-элементам
   * @private
   */
  private _bindEventListeners(): void {
    // Обработчик клика по кнопке закрытия
    const handleCloseButtonClick = (): void => {
      // Генерируем событие о закрытии окна успешного заказа
      this.events.emit("success:closed");
    };

    // Подписываемся на клик по кнопке закрытия
    this.closeButton.addEventListener("click", handleCloseButtonClick);
  }

  /**
   * Устанавливает итоговую сумму списанных синапсов
   * Обновляет текст в элементе описания
   * @param value - количество списанных синапсов
   */
  set total(value: number) {
    // Устанавливаем текстовое содержимое элемента описания
    this.descriptionElement.textContent = `Списано ${value} синапсов`;
  }
}
