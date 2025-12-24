import { IProduct } from "../../types";

/**
 * Корзина покупок — управление товарами, расчёт стоимости и проверка состояния
 */
class ShoppingCart {
  private items: IProduct[] = [];

  /**
   * Добавляет товар в корзину
   * @param item Товар для добавления
   */
  addItem(item: IProduct): void {
    this.items.push(item);
  }

  /**
   * Удаляет товар из корзины по ID
   * @param id Идентификатор товара
   * @returns true, если товар был найден и удалён
   */
  removeItemById(id: string): boolean {
    const found = this.hasItem(id);
    this.items = this.items.filter((item) => item.id !== id);
    return found;
  }

  /**
   * Проверяет наличие товара в корзине
   * @param id Идентификатор товара
   * @returns true, если товар есть в корзине
   */
  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
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
  }
}

export default ShoppingCart;
