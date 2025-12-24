import "./scss/styles.scss";

import { testBuyer } from "./test/TestBuyer";
import { testShoppingCart } from "./test/TestShoppingCart";
import { testProductCatalog } from "./test/TestProductCatalog";
import { testApiClient } from "./test/TestApiClient";

////////////////////////////////////////////////////////////////////////////////////////////
testBuyer();
testProductCatalog();
testApiClient();
testShoppingCart();
