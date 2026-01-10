import { ensureElement } from "../../../utils/utils.ts";
import { IEvents } from "../../base/Events.ts";
import { Form } from "./Form.ts";
import { IErrors, TContactsForm } from "../../../types/index.ts";

/**
 * Класс формы контактных данных
 * Отвечает за ввод email и телефона пользователя
 * Наследуется от базового класса Form
 */
export class ContactsForm extends Form<TContactsForm> {
  // Поле ввода электронной почты
  protected emailElement: HTMLInputElement;
  // Поле ввода номера телефона
  protected phoneElement: HTMLInputElement;

  /**
   * Конструктор формы контактов
   * @param events - шина событий для коммуникации между компонентами
   * @param container - DOM-контейнер, содержащий форму
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Form
    super(events, container);

    // Инициализируем DOM-элементы формы
    // Селектор для поиска поля email по атрибуту name
    const emailSelector = 'input[name="email"]';
    // Селектор для поиска поля телефона по атрибуту name
    const phoneSelector = 'input[name="phone"]';

    // Находим поле email внутри контейнера формы
    this.emailElement = ensureElement<HTMLInputElement>(
      emailSelector,
      this.container
    );

    // Находим поле телефона внутри контейнера формы
    this.phoneElement = ensureElement<HTMLInputElement>(
      phoneSelector,
      this.container
    );
    // Привязываем обработчики событий к полям ввода
    this._attachInputListeners();

    // Настраиваем кнопку отправки формы
    this._configureSubmitButton();

    // Подписываемся на событие ошибок валидации
    this._subscribeToValidationErrors();
  }

  /**
   * Привязка обработчиков события input к полям формы
   * При каждом изменении значения отправляется событие в шину
   */
  private _attachInputListeners(): void {
    // Обработчик изменения поля email
    const handleEmailInput = (): void => {
      // Получаем текущее значение из поля ввода
      const currentEmailValue = this.emailElement.value;

      // Отправляем событие с названием поля и его значением
      this.events.emit("order:change", {
        field: "email",
        value: currentEmailValue,
      });
    };

    // Обработчик изменения поля телефона
    const handlePhoneInput = (): void => {
      // Получаем текущее значение из поля ввода
      const currentPhoneValue = this.phoneElement.value;

      // Отправляем событие с названием поля и его значением
      this.events.emit("order:change", {
        field: "phone",
        value: currentPhoneValue,
      });
    };

    // Вешаем слушатель на поле email
    this.emailElement.addEventListener("input", handleEmailInput);

    // Вешаем слушатель на поле телефона
    this.phoneElement.addEventListener("input", handlePhoneInput);
  }

  /**
   * Настройка кнопки отправки формы
   * Устанавливает текст и обработчик клика
   */
  private _configureSubmitButton(): void {
    // Текст кнопки для данного шага оформления заказа
    const buttonLabel = "Оплатить";

    // Устанавливаем текст на кнопку
    this.nextButton.textContent = buttonLabel;

    // Обработчик нажатия на кнопку отправки
    const handleSubmitClick = (event: Event): void => {
      // Предотвращаем стандартное поведение формы (перезагрузку страницы)
      event.preventDefault();

      // Проверяем, не заблокирована ли кнопка
      const isButtonDisabled = this.nextButton.disabled;

      // Если кнопка заблокирована - выходим из обработчика
      if (isButtonDisabled) {
        return;
      }

      // Отправляем событие успешной отправки формы контактов
      this.events.emit("contacts:submit");
    };

    // Привязываем обработчик к кнопке
    this.nextButton.addEventListener("click", handleSubmitClick);
  }

  /**
   * Подписка на события валидации формы
   * При получении ошибок запускает проверку формы
   */
  private _subscribeToValidationErrors(): void {
    // Обработчик события ошибок
    const handleValidationErrors = (errors: IErrors): void => {
      // Передаём ошибки в метод валидации
      this.validateForm(errors);
    };

    // Подписываемся на событие ошибок
    this.events.on("form:errors", handleValidationErrors);
  }

  /**
   * Сеттер для установки значения поля email
   * @param value - значение email или null
   */
  set emailValue(value: string | null) {
    // Проверяем, что переданное значение не null
    const hasValue = value !== null;

    if (hasValue) {
      // Устанавливаем значение в поле ввода
      this.emailElement.value = value;
    }
  }

  /**
   * Сеттер для установки значения поля телефона
   * @param value - значение телефона или null
   */
  set phoneValue(value: string | null) {
    // Проверяем, что переданное значение не null
    const hasValue = value !== null;

    if (hasValue) {
      // Устанавливаем значение в поле ввода
      this.phoneElement.value = value;
    }
  }

  /**
   * Валидация формы и отображение ошибок
   * @param errors - объект с ошибками валидации
   */
  validateForm(errors: IErrors): void {
    // Собираем массив из возможных ошибок полей email и phone
    const possibleErrors = [errors.email, errors.phone];

    // Фильтруем массив, оставляя только непустые значения
    // Boolean отсеивает undefined, null, пустые строки
    const actualErrors = possibleErrors.filter(Boolean);

    // Определяем, есть ли ошибки в форме
    const hasNoErrors = actualErrors.length === 0;

    // Устанавливаем состояние кнопки: активна если ошибок нет
    this.isButtonValid = hasNoErrors;

    // Формируем текст ошибок для отображения
    if (hasNoErrors) {
      // Если ошибок нет - очищаем поле ошибок
      this.errors = "";
    } else {
      // Если есть ошибки - объединяем их через запятую
      const errorMessage = actualErrors.join(", ");
      this.errors = errorMessage;
    }
  }
}
