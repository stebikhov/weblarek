import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";
import { Card } from "./Card.ts";
import { categoryMap, CDN_URL } from "../../../utils/constants.ts";
import { CategoryKey, TPreviewCard } from "../../../types/index.ts";

/**
 * Класс превью карточки товара
 *
 * Расширяет базовый класс Card, добавляя функциональность
 * детального просмотра товара с возможностью добавления в корзину
 */
export class PreviewCard extends Card<TPreviewCard> {
  // DOM-элемент для отображения категории товара
  protected categoryElement: HTMLElement;

  // DOM-элемент для отображения описания товара
  protected descriptionElement: HTMLElement;

  // Кнопка действия (купить/удалить из корзины)
  protected cardButton: HTMLButtonElement;

  // DOM-элемент изображения товара
  protected imageElement: HTMLImageElement;

  // Флаг наличия товара в корзине
  protected _inCart: boolean = false;

  /**
   * Создаёт экземпляр превью карточки
   *
   * @param events - Брокер событий для коммуникации между компонентами
   * @param container - HTML-контейнер карточки
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Вызываем конструктор родительского класса
    super(container);

    // Находим и сохраняем ссылки на DOM-элементы
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );

    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );

    this.descriptionElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container
    );

    this.cardButton = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container
    );
  }

  addButtonHandler(f: () => any): void {
    this.cardButton.addEventListener("click", f);
  }

  /**
   * Устанавливает категорию товара
   *
   * Обновляет текст категории и применяет соответствующий CSS-класс
   * для стилизации в зависимости от типа категории
   *
   * @param value - Название категории
   */
  set category(value: string) {
    // Устанавливаем текстовое содержимое элемента категории
    this.categoryElement.textContent = value;

    // Перебираем все ключи в маппинге категорий
    for (const key in categoryMap) {
      // Приводим ключ к типу CategoryKey для типобезопасного доступа
      const typedKey = key as CategoryKey;

      // Получаем CSS-класс, соответствующий текущему ключу
      const correspondingCssClass = categoryMap[typedKey];

      // Определяем, совпадает ли текущий ключ с переданным значением
      const isMatchingCategory = key === value;

      // Переключаем CSS-класс: добавляем если категория совпадает, убираем если нет
      this.categoryElement.classList.toggle(
        correspondingCssClass,
        isMatchingCategory
      );
    }
  }

  /**
   * Устанавливает изображение товара
   *
   * Преобразует путь к SVG в PNG и формирует полный URL с CDN
   *
   * @param value - Относительный путь к файлу изображения
   */
  set image(value: string) {
    // Заменяем расширение svg на png для совместимости
    const convertedImagePath = value.replace(".svg", ".png");

    // Формируем полный URL изображения, добавляя адрес CDN
    const completeImageUrl = `${CDN_URL}/${convertedImagePath}`;

    // Определяем альтернативный текст из заголовка карточки
    const altText = this.title || "";

    // Применяем изображение к элементу через метод родительского класса
    this.setImage(this.imageElement, completeImageUrl, altText);
  }

  /**
   * Устанавливает описание товара
   *
   * @param value - Текст описания товара
   */
  set description(value: string) {
    // Записываем текст описания в соответствующий DOM-элемент
    this.descriptionElement.textContent = value;
  }

  /**
   * Устанавливает состояние товара относительно корзины
   *
   * Управляет отображением и поведением кнопки действия
   * в зависимости от наличия товара в корзине и его доступности
   *
   * @param value - true если товар в корзине, false если нет
   */
  set inCart(value: boolean) {
    // Проверяем, доступен ли товар для покупки (есть ли цена)
    const isPriceUnavailable = this.price === null;

    if (isPriceUnavailable) {
      // Товар недоступен - блокируем кнопку
      this.disableButton();
      return;
    }

    // Товар доступен - настраиваем кнопку в зависимости от состояния корзины
    if (value) {
      // Товар уже в корзине
      this.cardButton.textContent = "Удалить из корзины";
      this.cardButton.disabled = false;
    } else {
      // Товара нет в корзине
      this.cardButton.textContent = "Купить";
      this.cardButton.disabled = false;
    }
  }

  /**
   * Деактивирует кнопку действия
   *
   * Используется когда товар недоступен для покупки
   * (например, когда цена не установлена)
   */
  disableButton(): void {
    // Блокируем кнопку от нажатий
    this.cardButton.disabled = true;

    // Меняем текст кнопки на информативный
    this.cardButton.textContent = "Недоступно";
  }
}
