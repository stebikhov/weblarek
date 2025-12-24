import Buyer from "../components/models/Buyer";

export function testBuyer() {
  // Создаём экземпляр для тестов
  const buyer = new Buyer();

  console.log("🚀 Запуск тестов для Buyer");

  // 1. Тест метода update
  console.log("\n1. Тест update()");
  buyer.update({ email: "test@example.com" });
  console.assert(
    buyer.getData().email === "test@example.com",
    "update(): не обновил email"
  );

  buyer.update({ phone: "+79991234567" });
  console.assert(
    buyer.getData().phone === "+79991234567",
    "update(): не обновил phone"
  );

  // 2. Тест isValid
  console.log("\n6. Тест isValid()");
  console.assert(
    !buyer.isValid(),
    "isValid(): false при пустых данных (ожидается)"
  );
  buyer.update({ payment: "card" }); // Частично заполнили
  console.assert(
    !buyer.isValid(),
    "isValid(): false при неполных данных (ожидается)"
  );
  buyer.update({
    email: "user@example.com",
    phone: "+79991234567",
    address: "ул. Примерная, 1",
  });
  console.assert(
    buyer.isValid(),
    "isValid(): true при полных данных (ожидается)"
  );

  // 3. Тест getData (проверка на копирование)
  console.log("\n2. Тест getData()");
  const data1 = buyer.getData();
  const data2 = buyer.getData();
  console.assert(
    data1 !== data2,
    "getData(): не возвращает новую копию объекта"
  );
  console.assert(
    data1.email === data2.email,
    "getData(): данные не совпадают между копиями"
  );

  // 4. Тест clear
  console.log("\n3. Тест clear()");
  buyer.clear();
  const clearedData = buyer.getData();
  console.assert(clearedData.email === null, "clear(): email не сброшен");
  console.assert(clearedData.phone === null, "clear(): phone не сброшен");

  // 5. Тест validate (ошибки)
  console.log("\n4. Тест validate() — проверка ошибок");
  const errors = buyer.validate();
  console.assert("payment" in errors, "validate(): нет ошибки для payment");
  console.assert("email" in errors, "validate(): нет ошибки для email");
  console.assert("phone" in errors, "validate(): нет ошибки для phone");
  console.assert("address" in errors, "validate(): нет ошибки для address");

  // 6. Тест validate (нет ошибок)
  console.log("\n5. Тест validate() — валидные данные");
  buyer.update({
    payment: "card",
    email: "user@example.com",
    phone: "+79991234567",
    address: "ул. Примерная, 1",
  });
  const noErrors = buyer.validate();
  console.assert(
    Object.keys(noErrors).length === 0,
    "validate(): есть ошибки при валидных данных"
  );

  // 7. Тест getField
  console.log("\n7. Тест getField()");
  console.assert(
    buyer.getField("email") === "user@example.com",
    "getField(): вернул неверный email"
  );
  console.assert(
    buyer.getField("payment") === "card",
    "getField(): вернул неверный payment"
  );

  // 8. Тест setField
  console.log("\n8. Тест setField()");
  buyer.setField("email", "new@example.com");
  console.assert(
    buyer.getField("email") === "new@example.com",
    "setField(): не обновил email"
  );
  buyer.setField("payment", null);
  console.assert(
    buyer.getField("payment") === null,
    "setField(): не установил null"
  );

  console.log("\n✅ Все тесты выполнены!");
}
