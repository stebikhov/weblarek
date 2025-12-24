import { IApi, IProduct, TOrderResponse, ApiPostMethods } from "../../types";

/**
 * Модуль для работы с API
 */
class ApiClient {
  private readonly api: IApi;

  constructor(api: IApi) {
    if (!api) {
      throw new Error("API instance is required");
    }
    this.api = api;
  }

  /**
   * Получает список продуктов
   * @returns Массив продуктов
   * @throws Ошибка при неудачном запросе
   */
  async getCatalog(): Promise<IProduct[]> {
    const response = await this.api.get<{ items: IProduct[] }>("/product");
    return response.items;
  }

  /**
   * Отправляет заказ на сервер
   * @param orderData Данные заказа
   * @returns Подтверждение создания заказа с ID и суммой
   * @throws Ошибка при неудачной отправке
   */
  async sendOrder(
    orderData: Omit<TOrderResponse, "id">
  ): Promise<TOrderResponse> {
    const response = await this.api.post<TOrderResponse>(
      "/order",
      orderData,
      "POST" as ApiPostMethods
    );
    return response;
  }
}

export default ApiClient;
