import { Component } from "../../base/Component.ts";
import { ensureElement, ensureAllElements } from "../../../utils/utils.ts";
import { IEvents } from "../../base/Events.ts";
import { TForm } from "../../../types/index.ts";

/**
 * Базовый класс для работы с формами
 * Обеспечивает валидацию, управление состоянием кнопки отправки и обработку событий
 * @template T - дополнительные типы данных формы
 */
export class Form<T = {}> extends Component<TForm & T> {
  // Основной элемент формы
  protected formElement: HTMLFormElement;

  // Контейнер для отображения ошибок валидации
  protected formErrors: HTMLElement;

  // Кнопка отправки формы (submit)
  protected nextButton: HTMLButtonElement;

  // Массив всех полей ввода внутри формы
  protected formInputs: HTMLInputElement[];

  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Component
    super(container);

    // Инициализируем все элементы формы

    // Получаем основной элемент формы
    // Если контейнер уже является формой - используем его, иначе ищем внутри
    if (container instanceof HTMLFormElement) {
      this.formElement = container;
    } else {
      this.formElement = ensureElement<HTMLFormElement>(
        ".form",
        this.container
      );
    }

    // Находим кнопку отправки формы (type="submit")
    this.nextButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container
    );

    // Находим контейнер для вывода ошибок валидации
    this.formErrors = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    // Получаем все поля ввода формы
    this.formInputs = ensureAllElements<HTMLInputElement>(
      ".form__input",
      this.container
    );

    // Настраиваем обработчик события отправки формы
    this._setupFormSubmitHandler();
  }

  /**
   * Настройка обработчика события submit формы
   * @private
   */
  private _setupFormSubmitHandler(): void {
    // Добавляем слушатель на событие отправки формы
    this.formElement.addEventListener("submit", (e: Event) => {
      // Отменяем стандартное поведение браузера (перезагрузку страницы)
      e.preventDefault();

      // Проверяем, заблокирована ли кнопка отправки
      const isButtonDisabled = this.nextButton.disabled;

      // Если кнопка заблокирована - значит форма невалидна, прерываем выполнение
      if (isButtonDisabled) {
        return;
      }

      // Генерируем событие о переходе к следующему шагу
      this.events.emit("order:next");
    });
  }

  /**
   * Управление доступностью кнопки отправки формы
   * Устанавливает кнопку в активное или заблокированное состояние
   * @param value - true если форма валидна (кнопка активна), false если есть ошибки (кнопка заблокирована)
   */
  set isButtonValid(value: boolean) {
    // Инвертируем значение: если value=true (форма валидна), то disabled=false (кнопка активна)
    const shouldDisableButton = !value;
    this.nextButton.disabled = shouldDisableButton;
  }

  /**
   * Установка текста сообщения об ошибке
   * Отображает текст ошибки в контейнере для ошибок
   * @param text - текст ошибки для отображения пользователю
   */
  set errors(text: string) {
    // Проверяем, что контейнер для ошибок существует
    const hasErrorContainer =
      this.formErrors !== null && this.formErrors !== undefined;

    if (hasErrorContainer) {
      // Устанавливаем текст ошибки
      this.formErrors.textContent = text;
    }
  }
}
