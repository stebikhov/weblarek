import { Component } from "../../base/Component.ts";
import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

/**
 * Описывает структуру данных модального окна
 * @interface IModal
 */
interface IModal {
  /** Содержимое, отображаемое внутри модального окна */
  content: HTMLElement;
}

/**
 * Компонент модального окна с поддержкой открытия, закрытия
 * и динамической замены содержимого.
 *
 * @extends Component<IModal>
 *
 * @example
 * const modal = new Modal(events, document.querySelector('.modal'));
 * modal.content = someElement;
 * modal.open();
 */
export class Modal extends Component<IModal> {
  /**
   * Кнопка для закрытия модального окна
   * @protected
   */
  protected closeButton: HTMLButtonElement;

  /**
   * Контейнер, в который помещается содержимое модального окна
   * @protected
   */
  protected contentElement: HTMLElement;

  /**
   * Создаёт экземпляр модального окна
   *
   * @param events - Система событий для коммуникации между компонентами
   * @param container - Корневой DOM-элемент модального окна
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Component
    super(container);

    // Инициализируем внутренние элементы модального окна
    // Находим кнопку закрытия внутри контейнера модального окна
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container
    );

    // Находим контейнер для содержимого модального окна
    this.contentElement = ensureElement<HTMLElement>(
      ".modal__content",
      this.container
    );

    // Привязываем обработчики событий
    this.bindEventListeners();
  }

  /**
   * Привязывает обработчики событий к элементам модального окна
   * @private
   */
  private bindEventListeners(): void {
    // Обработчик клика по кнопке закрытия
    const handleCloseButtonClick = (): void => {
      this.close();
    };

    // Обработчик клика по фону модального окна (overlay)
    const handleOverlayClick = (event: MouseEvent): void => {
      // Получаем элемент, по которому кликнули
      const clickedElement = event.target as HTMLElement;

      // Проверяем, был ли клик именно по фону (overlay),
      // а не по содержимому внутри модального окна
      const isOverlayClicked = clickedElement === this.container;

      // Закрываем модальное окно только при клике по фону
      if (isOverlayClicked) {
        this.close();
      }
    };

    // Регистрируем обработчик на кнопке закрытия
    this.closeButton.addEventListener("click", handleCloseButtonClick);

    // Регистрируем обработчик на контейнере для отслеживания кликов по overlay
    this.container.addEventListener("click", handleOverlayClick);
  }

    /**
   * Открывает модальное окно, добавляя CSS-класс активного состояния
   * @public
   */
  open(content: HTMLElement): void {
    this.content = content;
    this.container.classList.add("modal_active");
  }

  /**
   * Закрывает модальное окно и очищает его содержимое
   * @public
   */
  close(): void {
    // Убираем класс активного состояния, скрывая модальное окно
    this.container.classList.remove("modal_active");

    // Полностью очищаем содержимое модального окна,
    // удаляя все дочерние элементы
    this.contentElement.replaceChildren();
  }

  /**
   * Устанавливает новое содержимое модального окна
   *
   * @param element - DOM-элемент, который будет отображён в модальном окне
   *
   * @example
   * modal.content = document.createElement('div');
   */
  set content(element: HTMLElement) {
    // Сначала очищаем текущее содержимое
    this.contentElement.replaceChildren();

    // Затем добавляем новый элемент
    this.contentElement.appendChild(element);
  }
}
