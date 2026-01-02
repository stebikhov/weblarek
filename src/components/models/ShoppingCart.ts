import { IProduct } from '../../types/index.ts';
import { EventEmitter } from '../base/Events.ts';

/**
 * Корзина покупок — управление товарами, расчёт стоимости и проверка состояния
 */
export class ShoppingCart extends EventEmitter {
  private items: IProduct[] = [];

  /**
   * Добавляет товар в корзину
   * @param item Товар для добавления
   */
  addItem(item: IProduct): void {
    this.items.push(item);
    this.emit('basket:changed', this.getItems());
  }

  /**
   * Удаляет товар из корзины по ID
   * @param id Идентификатор товара
   * @returns true, если товар был найден и удалён
   */
  removeItemById(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.emit('basket:changed', this.getItems());
  }

  /**
   * Проверяет наличие товара в корзине
   * @param id Идентификатор товара
   * @returns true, если товар есть в корзине
   */
  hasItem(id: string | undefined): boolean {
    const res = this.items.some((item) => item.id == id);
    return res;
  }

  /**
   * Возвращает список товаров в корзине
   * @returns Массив товаров
   */
  getItems(): IProduct[] {
    return [...this.items]; // Возвращаем копию для защиты от внешних мутаций
  }

  /**
   * Возвращает количество товаров в корзине
   * @returns Число товаров
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Рассчитывает общую стоимость товаров в корзине
   * @returns Сумма в числовом формате
   */
  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
  }

  /**
   * Очищает корзину полностью
   */
  clear(): void {
    this.items = [];
    this.emit('basket:changed', this.getItems());
  }
}

export default ShoppingCart;
