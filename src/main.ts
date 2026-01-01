import { apiProducts } from './utils/data';
import { ProductCatalog } from './components/models/ProductCatalog';
import { Basket } from './components/models/Basket';
import { BuyerModel } from './components/models/BuyerModel';
import { Api } from './components/base/Api';
import { Server } from './components/communication/Server';
import { API_URL } from './utils/constants';

console.log('ПРОВЕРКА РАБОТЫ МОДЕЛЕЙ ДАННЫХ');

const catalog = new ProductCatalog();

// сохраняем товары в каталог
catalog.setProducts(apiProducts.items);

// получаем все товары
console.log('Массив товаров из каталога:', catalog.getProducts());

// получаем товар по id
const firstProduct = apiProducts.items[0];
console.log(
  'Товар по id:',
  catalog.getProductById(firstProduct.id)
);

// сохраняем товар для детального просмотра
catalog.setSelectedProduct(firstProduct);

// получаем выбранный товар
console.log(
  'Выбранный товар:',
  catalog.getSelectedProduct()
);

const basket = new Basket();

const product1 = apiProducts.items[0];
const product2 = apiProducts.items[1];
const productWithNullPrice = apiProducts.items[2];

// добавляем товары в корзину
basket.addItem(product1);
basket.addItem(product2);
basket.addItem(productWithNullPrice);

// получаем товары корзины
console.log('Товары в корзине:', basket.getItems());

// количество товаров
console.log(
  'Количество товаров в корзине:',
  basket.getItemsCount()
);

// общая стоимость корзины
console.log(
  'Общая стоимость корзины:',
  basket.getTotalPrice()
);

// проверка наличия товара
console.log(
  'Есть ли товар в корзине:',
  basket.hasItem(product1.id)
);

// удаляем товар
basket.removeItem(product1);
console.log(
  'Корзина после удаления товара:',
  basket.getItems()
);

// очищаем корзину
basket.clear();
console.log(
  'Корзина после очистки:',
  basket.getItems()
);

const buyer = new BuyerModel();

// проверка валидации пустых данных
console.log(
  'Ошибки валидации (пустые данные):',
  buyer.validate()
);

// частичное сохранение данных
buyer.setData({
  email: 'test@test.ru',
  phone: '+79999999999',
});

console.log(
  'Данные покупателя (частично):',
  buyer.getData()
);

// повторная валидация
console.log(
  'Ошибки валидации (частично заполнено):',
  buyer.validate()
);

// сохранение всех данных
buyer.setData({
  payment: 'card',
  address: 'Москва, ул. Пушкина, д. 1',
});

console.log(
  'Данные покупателя (полные):',
  buyer.getData()
);

// финальная валидация
console.log(
  'Ошибки валидации (все поля заполнены):',
  buyer.validate()
);

// очистка данных
buyer.clear();
console.log(
  'Данные покупателя после очистки:',
  buyer.getData()
);

console.log('ПРОВЕРКА РАБОТЫ С СЕРВЕРОМ')

const api = new Api(API_URL);
const server = new Server(api);

// Получаем товары с сервера
async function loadProductsFromServer() {
    try {
        console.log('Запрос товаров с сервера...');
        const products = await server.getProducts();
        
        // Сохраняем товары с сервера в каталог
        catalog.setProducts(products);
        
        console.log('Товары с сервера:', catalog.getProducts());
        console.log('Количество товаров:', products.length);
        
    } catch (error) {
        console.error('Ошибка при загрузке товаров с сервера:', error);
        console.log('Используем локальные данные');
        catalog.setProducts(apiProducts.items);
    }
}

// Запускаем загрузку товаров с сервера
loadProductsFromServer();