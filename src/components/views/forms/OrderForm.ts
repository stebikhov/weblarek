import { ensureElement } from "../../../utils/utils.ts";
import { IEvents } from "../../base/Events.ts";
import { Form } from "./Form.ts";
import { TPayment, IErrors, TOrderForm } from "../../../types/index.ts";

/**
 * Класс формы оформления заказа.
 * Отвечает за выбор способа оплаты и ввод адреса доставки.
 * Наследуется от базового класса Form.
 */
export class OrderForm extends Form<TOrderForm> {
  // Поле ввода адреса доставки
  protected addressElement: HTMLInputElement;

  // Кнопка выбора оплаты наличными
  protected cashButton: HTMLButtonElement;

  // Кнопка выбора оплаты картой
  protected cardButton: HTMLButtonElement;

  /**
   * Создаёт экземпляр формы заказа.
   * @param events - Брокер событий для коммуникации между компонентами
   * @param container - HTML-контейнер, содержащий разметку формы
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса Form
    super(events, container);

    // Инициализируем все DOM-элементы формы
    // CSS-селекторы для поиска элементов
    const cashButtonSelector = 'button[name="cash"]';
    const cardButtonSelector = 'button[name="card"]';
    const addressInputSelector = 'input[name="address"]';

    // Находим кнопку оплаты наличными
    this.cashButton = ensureElement<HTMLButtonElement>(
      cashButtonSelector,
      this.container
    );

    // Находим кнопку оплаты картой
    this.cardButton = ensureElement<HTMLButtonElement>(
      cardButtonSelector,
      this.container
    );

    // Находим поле ввода адреса
    this.addressElement = ensureElement<HTMLInputElement>(
      addressInputSelector,
      this.container
    );
    // Сбрасываем начальное состояние кнопок оплаты
    this._resetPaymentButtonsState();

    // Привязываем обработчики событий к элементам формы
    this._bindEventHandlers();
  }

  /**
   * Сбрасывает визуальное состояние кнопок выбора оплаты.
   * Убирает класс активности с обеих кнопок.
   */
  private _resetPaymentButtonsState(): void {
    // CSS-класс, обозначающий активную (выбранную) кнопку
    const activeButtonClass = "button_alt-active";

    // Деактивируем кнопку наличных
    this.cashButton.classList.remove(activeButtonClass);

    // Деактивируем кнопку карты
    this.cardButton.classList.remove(activeButtonClass);
  }

  /**
   * Привязывает обработчики событий ко всем интерактивным элементам формы.
   */
  private _bindEventHandlers(): void {
    // Обработчик клика по кнопке "Наличные"
    const onCashButtonClick = (): void => {
      // Устанавливаем способ оплаты "наличные"
      this._updatePayment("cash");
    };

    // Обработчик клика по кнопке "Карта"
    const onCardButtonClick = (): void => {
      // Устанавливаем способ оплаты "карта"
      this._updatePayment("card");
    };

    // Обработчик ввода в поле адреса
    const onAddressInput = (): void => {
      // Получаем текущее значение поля
      const currentAddress = this.addressElement.value;

      // Формируем объект с данными об изменении
      const changeData = {
        field: "address",
        value: currentAddress,
      };

      // Отправляем событие об изменении поля формы
      this.events.emit("order:change", changeData);
    };

    // Обработчик клика по кнопке "Далее"
    const onNextButtonClick = (event: Event): void => {
      // Предотвращаем стандартное поведение кнопки (отправку формы)
      event.preventDefault();

      // Проверяем, не заблокирована ли кнопка
      const isButtonDisabled = this.nextButton.disabled;

      // Если кнопка заблокирована, прерываем выполнение
      if (isButtonDisabled) {
        return;
      }

      // Отправляем событие перехода к следующему шагу
      this.events.emit("order:next");
    };

    // Привязываем обработчики к соответствующим элементам
    this.cashButton.addEventListener("click", onCashButtonClick);
    this.cardButton.addEventListener("click", onCardButtonClick);
    this.addressElement.addEventListener("input", onAddressInput);
    this.nextButton.addEventListener("click", onNextButtonClick);
  }

  /**
   * Обновляет способ оплаты и уведомляет систему о его изменении.
   * Устанавливает новое значение способа оплаты через сеттер (для синхронизации интерфейса)
   * и генерирует событие 'order:change' с информацией о поле и значении.
   * Используется при взаимодействии пользователя с кнопками выбора оплаты.
   *
   * @param payment - Выбранный способ оплаты ('cash' или 'card')
   *
   * @emits order:change — Событие изменения поля формы, передаёт объект с полями:
   * - `field`: имя изменённого поля ('payment')
   * - `value`: новое значение способа оплаты
   */
  private _updatePayment(payment: TPayment) {
    this.payment = payment;

    this.events.emit("order:change", {
      field: "payment",
      value: payment,
    });
  }

  /**
   * Сеттер для программной установки способа оплаты.
   * Обновляет только визуальное состояние кнопок без отправки события.
   * @param value - Способ оплаты для установки
   */
  set payment(value: TPayment) {
    // CSS-класс для выделения активной кнопки
    const highlightClass = "button_alt-active";

    // Сбрасываем выделение с обеих кнопок
    this.cardButton.classList.remove(highlightClass);
    this.cashButton.classList.remove(highlightClass);

    // Проверяем, какой способ оплаты установлен
    const shouldHighlightCard = value === "card";
    const shouldHighlightCash = value === "cash";

    // Выделяем нужную кнопку
    if (shouldHighlightCard) {
      this.cardButton.classList.add(highlightClass);
    } else if (shouldHighlightCash) {
      this.cashButton.classList.add(highlightClass);
    }
  }

  /**
   * Сеттер для программной установки значения адреса.
   * @param value - Адрес для установки в поле ввода (null игнорируется)
   */
  set addressValue(value: string | null) {
    // Проверяем, передано ли корректное значение
    const hasValidValue = value !== null;

    // Устанавливаем значение только если оно не null
    if (hasValidValue) {
      this.addressElement.value = value;
    }
  }

  /**
   * Валидирует форму заказа на основе переданных ошибок.
   * Обновляет состояние кнопки отправки и отображает сообщения об ошибках.
   * @param errors - Объект с ошибками валидации полей
   */
  validateForm(errors: IErrors): void {
    // Собираем потенциальные ошибки полей адреса и способа оплаты
    const potentialErrors = [errors.address, errors.payment];

    // Фильтруем, оставляя только реальные ошибки (непустые значения)
    // Boolean отсеивает undefined, null, пустые строки
    const actualErrors = potentialErrors.filter(Boolean);

    // Определяем, валидна ли форма (нет ошибок)
    const isFormValid = actualErrors.length === 0;

    // Устанавливаем состояние кнопки "Далее"
    this.isButtonValid = isFormValid;

    // Определяем, есть ли ошибки для отображения
    const hasErrors = actualErrors.length > 0;

    // Формируем и устанавливаем текст ошибок
    if (hasErrors) {
      // Объединяем все ошибки в одну строку через запятую
      const errorMessage = actualErrors.join(", ");
      this.errors = errorMessage;
    } else {
      // Очищаем поле ошибок, если форма валидна
      this.errors = "";
    }
  }
}
