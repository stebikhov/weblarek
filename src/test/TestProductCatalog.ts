import { IProduct } from "../types";
import ProductCatalog from "../components/models/ProductCatalog";

export function testProductCatalog() {
  console.log("🚀 Запуск тестов для класса ProductCatalog");

  // Подготовка тестовых данных
  const product1: IProduct = {
    id: "1",
    title: "Товар 1",
    price: 100,
    description: "",
    image: "",
    category: "",
  };
  const product2: IProduct = {
    id: "2",
    title: "Товар 2",
    price: 200,
    description: "",
    image: "",
    category: "",
  };
  const product3: IProduct = {
    id: "3",
    title: "Товар 3",
    price: 150,
    description: "",
    image: "",
    category: "",
  };

  // Создаём экземпляр каталога
  const catalog = new ProductCatalog();

  // 1. Проверка начального состояния
  console.log("\n1. Начальное состояние каталога");
  console.assert(
    catalog.getProducts().length === 0,
    "Ошибка: список продуктов не пуст при создании"
  );
  console.assert(
    catalog.getSelectedProduct() === null,
    "Ошибка: выбран продукт при создании"
  );
  console.assert(
    !catalog.hasSelectedProduct(),
    "Ошибка: hasSelectedProduct возвращает true при создании"
  );

  // 2. Тестирование setProducts и getProducts
  console.log("\n2. Установка и получение списка продуктов");
  catalog.setProducts([product1, product2]);
  const products = catalog.getProducts();
  console.assert(
    products.length === 2,
    "Ошибка: неверное количество продуктов после setProducts"
  );
  console.assert(
    products[0].id === "1",
    "Ошибка: неверный продукт в списке после setProducts"
  );

  // Проверка защиты от мутаций (изменение копии не влияет на оригинал)
  products.push(product3);
  console.assert(
    catalog.getProducts().length === 2,
    "Ошибка: внешний массив изменил внутреннее состояние"
  );

  // 3. Тестирование getProductById
  console.log("\n3. Поиск продукта по ID");
  const foundProduct = catalog.getProductById("1");
  console.assert(
    foundProduct !== undefined && foundProduct.id === "1",
    "Ошибка: не найден существующий продукт"
  );
  const notFoundProduct = catalog.getProductById("999");
  console.assert(
    notFoundProduct === undefined,
    "Ошибка: найден несуществующий продукт"
  );

  // 4. Тестирование selectProduct и getSelectedProduct
  console.log("\n4. Выбор и получение выбранного продукта");
  catalog.selectProduct(product2);
  const selected = catalog.getSelectedProduct();
  console.assert(
    selected !== null && selected.id === "2",
    "Ошибка: неверный выбранный продукт"
  );
  console.assert(
    catalog.hasSelectedProduct(),
    "Ошибка: hasSelectedProduct возвращает false после выбора"
  );

  // 5. Тестирование clearSelectedProduct
  console.log("\n5. Сброс выбранного продукта");
  catalog.clearSelectedProduct();
  console.assert(
    catalog.getSelectedProduct() === null,
    "Ошибка: продукт не сброшен после clearSelectedProduct"
  );
  console.assert(
    !catalog.hasSelectedProduct(),
    "Ошибка: hasSelectedProduct не обновился после сброса"
  );

  // 6. Проверка повторного выбора продукта
  console.log("\n6. Повторный выбор продукта");
  catalog.selectProduct(product3);
  console.assert(
    catalog.getSelectedProduct()?.id === "3",
    "Ошибка: повторный выбор продукта не сработал"
  );

  // 7. Тестирование обновления списка продуктов
  console.log("\n7. Обновление списка продуктов");
  catalog.setProducts([product3]);
  const updatedProducts = catalog.getProducts();
  console.assert(
    updatedProducts.length === 1,
    "Ошибка: неверное количество после обновления списка"
  );
  console.assert(
    updatedProducts[0].id === "3",
    "Ошибка: неверный продукт после обновления списка"
  );

  // 8. Проверка поиска в обновлённом списке
  console.log("\n8. Поиск в обновлённом списке");
  const foundInUpdated = catalog.getProductById("3");
  console.assert(
    foundInUpdated !== undefined,
    "Ошибка: не найден продукт в обновлённом списке"
  );
  const notFoundInUpdated = catalog.getProductById("1");
  console.assert(
    notFoundInUpdated === undefined,
    "Ошибка: найден удалённый продукт в обновлённом списке"
  );

  // 9. Комплексный тест (цепочка операций)
  console.log("\n9. Цепочка операций");
  catalog.setProducts([product1, product2, product3]);
  catalog.selectProduct(product1);
  catalog.clearSelectedProduct();
  catalog.setProducts([product2]);

  console.assert(
    catalog.getProducts().length === 1,
    "Ошибка: неверное количество после цепочки операций"
  );
  console.assert(
    !catalog.hasSelectedProduct(),
    "Ошибка: выбранный продукт остался после цепочки операций"
  );

  // 10. Проверка граничного случая (пустой массив)
  console.log("\n10. Установка пустого массива продуктов");
  catalog.setProducts([]);
  console.assert(
    catalog.getProducts().length === 0,
    "Ошибка: не пустой список после установки пустого массива"
  );
  console.assert(
    catalog.getProductById("1") === undefined,
    "Ошибка: найден продукт в пустом списке"
  );

  console.log("\n✅ Все тесты пройдены успешно!");
}
