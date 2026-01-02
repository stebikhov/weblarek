import { IProduct } from '../../types/index.ts';
import { EventEmitter } from "../base/Events.ts";

/**
 * Управление коллекцией продуктов и выбранным продуктом
 */
export class ProductCatalog extends EventEmitter {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

  /**
   * Устанавливает список продуктов
   * @param products Массив продуктов
   */
  setProducts(products: IProduct[]): void {
    this.products = [...products]; // Защита от мутаций внешнего массива
    this.emit('catalog:changed', this.getProducts())
  }

  /**
   * Возвращает текущий список продуктов
   * @returns Массив продуктов
   */
  getProducts(): IProduct[] {
    return [...this.products]; // Возврат копии для защиты от внешних мутаций
  }

  /**
   * Находит продукт по ID
   * @param id Уникальный идентификатор продукта
   * @returns Продукт или undefined, если не найден
   */
  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  /**
   * Устанавливает выбранный продукт
   * @param product Продукт для выбора
   */
  selectProduct(product: IProduct): void {
    this.selectedProduct = product;
  }

  /**
   * Возвращает выбранный продукт
   * @returns Выбранный продукт или null, если ничего не выбрано
   */
  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }

  /**
   * Сбрасывает выбранный продукт
   */
  clearSelectedProduct(): void {
    this.selectedProduct = null;
  }

  /**
   * Проверяет, выбран ли какой‑либо продукт
   * @returns true, если продукт выбран
   */
  hasSelectedProduct(): boolean {
    return this.selectedProduct !== null;
  }
}

export default ProductCatalog;
