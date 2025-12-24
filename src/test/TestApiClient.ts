import ApiClient from "../components/api/ApiClient";
import ProductCatalog from "../components/models/ProductCatalog";
import { Api } from "../components/base/Api";
import { API_URL } from "../utils/constants";

export async function testApiClient() {
  console.log("🚀 Запуск простых тестов для ApiClient");

  // Тестовые данные

  const catalog = new ProductCatalog();
  //const cart = new Cart();
  //const buyer = new Buyer();

  // Создаем экземпляры Api и ApiModul
  const api = new Api(API_URL);

  const apiClient = new ApiClient(api);

  // 1. Тест конструктора: успешная инициализация
  console.log("\n1. Конструктор с валидным API");

  try {
    apiClient
      .getCatalog()
      .then((products) => {
        console.assert(
          products && products.length > 0,
          "Каталог товаров пуст!"
        );
        catalog.setProducts(products);
        console.log("Каталог товаров:", catalog.getProducts());
      })
      .catch((error) => {
        console.error("Ошибка получения каталога:", error);
      });
    console.log("\n✅ Все тесты ApiClient пройдены успешно!");
  } catch (error) {
    console.error("Ошибка получения каталога:", error);
  }

  // 2. Тест конструктора: отсутствие API → должна быть ошибка
  console.log("\n2. Конструктор без API (ожидаем ошибку)");
  let errorThrown = false;
  try {
    // @ts-ignore — намеренно передаём null для проверки
    new ApiClient(null);
  } catch (error) {
    errorThrown = true;
    console.assert(
      error instanceof Error && error.message === "API instance is required",
      "Ошибка: неверный текст ошибки при отсутствии API"
    );
  }
  console.assert(
    errorThrown,
    "Ошибка: исключение не выброшено при отсутствии API"
  );

  console.log("\n✅ Все тесты пройдены успешно!");
}
