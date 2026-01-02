import { IBuyer, IErrors } from '../../types/index.ts'
import { EventEmitter } from "../base/Events.ts";

/**
 * Класс для управления данными покупателя и их валидации
 */
export class Buyer extends EventEmitter {
   private data: IBuyer = {
    payment: null,
    email: null,
    phone: null,
    address: null,
  };

  /**
   * Обновляет данные покупателя (частично)
   * @param data Частичный объект с данными покупателя
   */
  update(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.emit('form:errors', this.validate());
  }

  /**
   * Получает полные данные покупателя
   * @returns Объект с данными покупателя
   */
  getData(): IBuyer {
    return { ...this.data }; // Возвращаем копию для защиты от мутаций
  }

  /**
   * Очищает все данные покупателя
   */
  clear(): void {
    this.data = {
      payment: null,
      email: null,
      phone: null,
      address: null,
    };
  }

    /**
   * Проверяет валидность данных покупателя
   * @returns Объект с сообщениями об ошибках (пустой, если ошибок нет)
   */
  validate(): IErrors {
    const errors: IErrors = {};
    
    if (this.data.payment === null) {
      errors.payment = "Укажите вид оплаты";
    }
    if (this.data.email === null || this.data.email.trim() === "") {
      errors.email = "Укажите email";
    }
    if (this.data.phone === null || this.data.phone.trim() === "") {
      errors.phone = "Укажите телефон";
    }
    if (this.data.address === null || this.data.address.trim() === "") {
      errors.address = "Укажите адрес доставки";
    }

    return errors;
  }

  /**
   * Проверяет, заполнены ли все обязательные поля
   * @returns true, если данные валидны
   */
  isValid(): boolean {
    return Object.keys(this.validate()).length === 0;
  }

  /**
   * Получает конкретное поле данных покупателя
   * @param field Ключ поля
   * @returns Значение поля или null
   */
  getField<K extends keyof IBuyer>(field: K): IBuyer[K] {
    return this.data[field];
  }

  /**
   * Устанавливает конкретное поле данных покупателя
   * @param field Ключ поля
   * @param value Значение поля
   */
  setField<K extends keyof IBuyer>(field: K, value: IBuyer[K]): void {
    this.data[field] = value;
    this.emit('form:errors', this.validate());
  }
}

export default Buyer;
