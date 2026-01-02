import { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";
import { Card } from "./Card.ts";
import { TCatalogCard, CategoryKey } from "../../../types/index.ts";
import { categoryMap, CDN_URL } from "../../../utils/constants.ts";

/**
 * Класс CardCatalog
 *
 * Представляет карточку товара в каталоге.
 * Наследуется от базового класса Card и расширяет его
 * функциональностью отображения категории и изображения товара.
 */
export class CatalogCard extends Card<TCatalogCard> {
  /** DOM-элемент для отображения категории товара */
  protected categoryElement: HTMLElement;

  /** DOM-элемент изображения товара */
  protected imageElement: HTMLImageElement;
  
  /**
   * Создаёт экземпляр карточки каталога
   *
   * @param events - Брокер событий для взаимодействия с другими компонентами
   * @param container - Корневой HTML-элемент карточки
   */
  constructor(protected events: IEvents, container: HTMLElement) {
    // Инициализируем родительский класс Card
    super(container);

    // Получаем ссылку на элемент категории внутри контейнера
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );

    // Получаем ссылку на элемент изображения внутри контейнера
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
  }

  /**
   * Устанавливает категорию товара
   *
   * Обновляет текстовое содержимое элемента категории
   * и применяет соответствующий CSS-класс для стилизации
   *
   * @param value - Название категории товара
   */
  set category(value: string) {
    // Записываем текст категории в DOM-элемент
    this.categoryElement.textContent = value;

    // Перебираем все доступные категории из маппинга
    // и переключаем CSS-классы в зависимости от совпадения
    for (const key in categoryMap) {
      // Приводим ключ к типу CategoryKey для корректного доступа к маппингу
      const categoryKey = key as CategoryKey;

      // Получаем CSS-класс для текущей категории
      const cssClassName = categoryMap[categoryKey];

      // Определяем, нужно ли добавить или убрать класс
      // Класс добавляется только если ключ совпадает с переданным значением
      const shouldApplyClass = key === value;

      // Переключаем CSS-класс на элементе категории
      this.categoryElement.classList.toggle(cssClassName, shouldApplyClass);
    }
  }

  /**
   * Устанавливает изображение товара
   *
   * Конвертирует SVG-путь в PNG и формирует полный URL
   * с использованием CDN для загрузки изображения
   *
   * @param value - Относительный путь к изображению
   */
  set image(value: string) {
    // Заменяем расширение .svg на .png для совместимости
    const pngImage = value.replace(".svg", ".png");

    // Формируем полный URL изображения с CDN
    const fullImageUrl = `${CDN_URL}/${pngImage}`;

    // Получаем альтернативный текст из заголовка карточки
    // Если заголовок не задан, используем пустую строку
    const alternativeText = this.title || "";

    // Устанавливаем изображение через метод родительского класса
    this.setImage(this.imageElement, fullImageUrl, alternativeText);
  }
}
