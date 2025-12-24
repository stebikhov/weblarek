import ShoppingCart from "../components/models/ShoppingCart";
import { IProduct } from "../types";

export function testShoppingCart() {
  console.log("🚀 Запуск тестов для ShoppingCart");

  // Создаём тестовые продукты
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

  // Создаём корзину
  const cart = new ShoppingCart();

  // 1. Тест addItem
  console.log("\n1. Тест addItem()");
  cart.addItem(product1);
  cart.addItem(product2);
  console.assert(cart.getItemCount() === 2, "addItem(): не добавились товары");
  console.assert(
    cart.hasItem("1") && cart.hasItem("2"),
    "addItem(): товары не найдены в корзине"
  );

  // 2. Тест hasItem
  console.log("\n2. Тест hasItem()");
  console.assert(cart.hasItem("1"), "hasItem(): не нашёл существующий товар");
  console.assert(!cart.hasItem("999"), "hasItem(): нашёл несуществующий товар");

  // 3. Тест getItems (проверка на копирование)
  console.log("\n3. Тест getItems()");
  const items1 = cart.getItems();
  const items2 = cart.getItems();
  console.assert(
    items1 !== items2,
    "getItems(): не возвращает новую копию массива"
  );
  console.assert(
    items1.length === 2 && items2.length === 2,
    "getItems(): разное количество товаров в копиях"
  );

  // 4. Тест getItemCount
  console.log("\n4. Тест getItemCount()");
  console.assert(
    cart.getItemCount() === 2,
    "getItemCount(): неверная длина корзины"
  );

  // 5. Тест getTotalPrice
  console.log("\n5. Тест getTotalPrice()");
  console.assert(
    cart.getTotalPrice() === 300,
    "getTotalPrice(): неверная сумма"
  );

  // 6. Тест removeItemById
  console.log("\n6. Тест removeItemById()");
  const removed = cart.removeItemById("1");
  console.assert(removed, "removeItemById(): не вернул true при удалении");
  console.assert(
    !cart.hasItem("1"),
    "removeItemById(): товар остался в корзине"
  );
  console.assert(
    cart.getItemCount() === 1,
    "removeItemById(): количество не обновилось"
  );

  // Проверка удаления несуществующего товара
  const notRemoved = cart.removeItemById("999");
  console.assert(
    !notRemoved,
    "removeItemById(): вернул true при отсутствии товара"
  );

  // 7. Тест getTotalPrice после удаления
  console.log("\n7. Тест getTotalPrice() после удаления");
  console.assert(
    cart.getTotalPrice() === 200,
    "getTotalPrice(): сумма не обновилась"
  );

  // 8. Тест clear
  console.log("\n8. Тест clear()");
  cart.clear();
  console.assert(cart.getItemCount() === 0, "clear(): корзина не очистилась");
  console.assert(cart.getTotalPrice() === 0, "clear(): сумма не сбросилась");
  console.assert(
    cart.getItems().length === 0,
    "clear(): getItems() возвращает не пустой массив"
  );

  // 9. Тест цепочки операций
  console.log("\n9. Тест последовательных операций");
  cart.addItem(product1);
  cart.addItem(product3);
  cart.removeItemById("3");
  console.assert(cart.getItemCount() === 1, "Цепочка операций: неверная длина");
  console.assert(
    cart.getTotalPrice() === 100,
    "Цепочка операций: неверная сумма"
  );
  console.assert(cart.hasItem("1"), "Цепочка операций: товар потерян");

  console.log("\n✅ Все тесты выполнены!");
}
