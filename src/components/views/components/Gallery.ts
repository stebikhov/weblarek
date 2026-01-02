import { Component } from "../../base/Component.ts";
import { ensureElement } from "../../../utils/utils.ts";

/**
 * Интерфейс данных галереи
 *
 * @property catalog - Массив HTML-элементов карточек товаров
 */
interface IGallery {
  catalog: HTMLElement[];
}

/**
 * Компонент галереи для отображения каталога товаров
 *
 * Отвечает за рендеринг списка карточек товаров в DOM.
 * Наследует базовую функциональность от Component.
 *
 * @extends Component<IGallery>
 */
export class Gallery extends Component<IGallery> {
  /**
   * Ссылка на DOM-элемент, в который будут помещаться карточки товаров
   *
   * В текущей реализации совпадает с корневым контейнером компонента,
   * но выделен в отдельное свойство для возможности будущего расширения
   */
  protected catalogElement: HTMLElement;

  /**
   * Создаёт экземпляр галереи
   *
   * @param container - Опциональный DOM-элемент контейнера.
   *                    Если не передан, будет выполнен автоматический
   *                    поиск элемента по селектору '.gallery'
   */
  constructor(container?: HTMLElement) {
    // Вызываем конструктор родительского класса
    // Если контейнер не передан — ищем элемент галереи в DOM
    const resolvedContainer =
      container || ensureElement<HTMLElement>(".gallery");
    super(resolvedContainer);

    // Инициализируем элемент каталога
    // Карточки товаров будут добавляться непосредственно в контейнер
    this.catalogElement = this.container;
  }

  /**
   * Устанавливает содержимое каталога
   *
   * Полностью заменяет текущие дочерние элементы контейнера
   * на переданный массив HTML-элементов карточек товаров.
   *
   * @param items - Массив HTML-элементов для отображения в галерее
   */
  set catalog(items: HTMLElement[]) {
    // Метод replaceChildren удаляет все существующие дочерние элементы
    // и добавляет новые за одну операцию (эффективнее, чем innerHTML)
    this.catalogElement.replaceChildren(...items);
  }
}
