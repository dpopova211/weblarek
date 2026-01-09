# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/main.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run dev
```

или

```
yarn
yarn dev
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Интернет-магазин «Web-Larёk»
«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут просматривать товары, добавлять их в корзину и оформлять заказы. Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает четкое разделение ответственности между классами слоев Model и View. Каждый слой несет свой смысл и ответственность:

Model - слой данных, отвечает за хранение и изменение данных.  
View - слой представления, отвечает за отображение данных на странице.  
Presenter - презентер содержит основную логику приложения и  отвечает за связь представления и данных.

Взаимодействие между классами обеспечивается использованием событийно-ориентированного подхода. Модели и Представления генерируют события при изменении данных или взаимодействии пользователя с приложением, а Презентер обрабатывает эти события используя методы как Моделей, так и Представлений.

### Базовый код

#### Класс Component
Является базовым классом для всех компонентов интерфейса.
Класс является дженериком и принимает в переменной `T` тип данных, которые могут быть переданы в метод `render` для отображения.

Конструктор:  
`constructor(container: HTMLElement)` - принимает ссылку на DOM элемент за отображение, которого он отвечает.

Поля класса:  
`container: HTMLElement` - поле для хранения корневого DOM элемента компонента.

Методы класса:  
`render(data?: Partial<T>): HTMLElement` - Главный метод класса. Он принимает данные, которые необходимо отобразить в интерфейсе, записывает эти данные в поля класса и возвращает ссылку на DOM-элемент. Предполагается, что в классах, которые будут наследоваться от `Component` будут реализованы сеттеры для полей с данными, которые будут вызываться в момент вызова `render` и записывать данные в необходимые DOM элементы.  
`setImage(element: HTMLImageElement, src: string, alt?: string): void` - утилитарный метод для модификации DOM-элементов `<img>`

#### Класс ViewComponent
Является базовым классом для всех компонентов представления, расширяющий функциональность класса Component. Предоставляет дополнительные утилитарные методы для работы с DOM.

Наследует: `Component<T>`

Конструктор класса не принимает параметров.

Методы класса:
`ensureElement<K extends HTMLElement>(selector: string, container?: HTMLElement): K` - находит элемент по селектору внутри контейнера компонента, выбрасывает ошибку если элемент не найден.
`setText(element: HTMLElement, value: unknown): void` - устанавливает текстовое содержимое элемента.
`setDisabled(element: HTMLElement, state: boolean): void` - управляет состоянием disabled элемента.

#### Класс Api
Содержит в себе базовую логику отправки запросов.

Конструктор:  
`constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

Поля класса:  
`baseUrl: string` - базовый адрес сервера  
`options: RequestInit` - объект с заголовками, которые будут использованы для запросов.

Методы:  
`get(uri: string): Promise<object>` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер  
`post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.  
`handleResponse(response: Response): Promise<object>` - защищенный метод проверяющий ответ сервера на корректность и возвращающий объект с данными полученный от сервера или отклоненный промис, в случае некорректных данных.

#### Класс EventEmitter
Брокер событий реализует паттерн "Наблюдатель", позволяющий отправлять события и подписываться на события, происходящие в системе. Класс используется для связи слоя данных и представления.

Конструктор класса не принимает параметров.

Поля класса:  
`_events: Map<string | RegExp, Set<Function>>)` -  хранит коллекцию подписок на события. Ключи коллекции - названия событий или регулярное выражение, значения - коллекция функций обработчиков, которые будут вызваны при срабатывании события.

Методы класса:  
`on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписка на событие, принимает название события и функцию обработчик.  
`emit<T extends object>(event: string, data?: T): void` - инициализация события. При вызове события в метод передается название события и объект с данными, который будет использован как аргумент для вызова обработчика.  
`trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие с передачей в него данных из второго параметра.

#### Данные
##### Интерфейсы данных
Товар (IProduct)

```typescript

interface IProduct {
  id: string;          // Уникальный идентификатор товара
  description: string; // Подробное описание товара
  image: string;       // URL изображения товара
  title: string;       // Название товара
  category: string;    // Категория товара
  price: number | null; // Цена товара (может быть null, если товар недоступен)
}
```

Назначение: Интерфейс описывает структуру данных товара, который отображается в каталоге, может быть просмотрен детально и добавлен в корзину.

Покупатель (IBuyer)

```typescript

interface IBuyer {
  payment: TPayment; // Способ оплаты
  email: string;     // Электронная почта покупателя
  phone: string;     // Телефон покупателя
  address: string;   // Адрес доставки
}

type TPayment = 'cash' | 'card' | null; // Допустимые способы оплаты
```

Назначение: Описывает структуру данных покупателя, необходимых для оформления заказа.

Заказ (IOrder)

```typescript

interface IOrder extends IBuyer {
    items: string[];
    total: number;
}
```

Назначение: Расширяет интерфейс покупателя, добавляя информацию о товарах в заказе и общей стоимости.

Ответ сервера (ApiListResponse)

```typescript

interface ApiListResponse<T> {
    total: number;
    items: T[];
}
```

Назначение: Типизирует ответы от сервера для списков данных.

#### Модели данных
##### Каталог товаров (ProductCatalog)
Класс отвечает за хранение и управление данными о товарах, доступных в магазине. Модель обеспечивает получение списка всех товаров, поиск товара по идентификатору, а также хранение товара, выбранного для детального просмотра.

Конструктор не принимает параметров.

Поля класса:
`products: IProduct[]` - массив всех товаров каталога
`selectedProduct: IProduct | null` - товар, выбранный для детального отображения

Методы класса:
`setProducts(items: IProduct[]): void` - сохраняет массив товаров, полученный в параметрах метода
`getProducts(): IProduct[]` - возвращает массив всех товаров из модели
`getProductById(id: string): IProduct | null` - возвращает товар по его идентификатору
`setSelectedProduct(item: IProduct): void` - сохраняет товар для детального отображения
`getSelectedProduct(): IProduct | null` - возвращает товар, выбранный для детального отображения

##### Корзина (Basket)
Класс отвечает за хранение и управление товарами, выбранными пользователем для покупки. Модель предоставляет методы для добавления, удаления, очистки товаров, а также расчет общей стоимости и количества товаров в корзине.

Конструктор не принимает параметров.

Поля класса:
`items: IProduct[]` - массив товаров, добавленных в корзину

Методы класса:
`getItems(): IProduct[]` - возвращает массив всех товаров в корзине
`addItem(item: IProduct): void` - добавляет товар, полученный в параметре, в корзину
`removeItem(id: string): void` - удаляет товар с указанным идентификатором из корзины
`clear(): void` - полностью очищает корзину
`getTotalPrice(): number` - возвращает общую стоимость всех товаров в корзине
`getItemsCount(): number` - возвращает количество товаров в корзине
`hasItem(id: string): boolean` - проверяет наличие товара с указанным идентификатором в корзине

##### Покупатель (BuyerModel)
Класс отвечает за хранение и управление данными покупателя, необходимыми для оформления заказа. Модель обеспечивает сохранение и валидацию контактных данных, способа оплаты, а также предоставляет методы для работы с этими данными.

Конструктор не принимает параметров.

Поля класса:
`payment: TPayment` - способ оплаты
`email: string` - электронная почта покупателя
`phone: string` - телефон покупателя
`address: string` - адрес доставки

Методы класса:
`setData(data: Partial<IBuyer>): void` - сохраняет данные покупателя. Метод принимает частичный объект покупателя, что позволяет обновлять отдельные поля без удаления других данных
`getData(): IBuyer` - возвращает все данные покупателя в виде объекта
`clear(): void` - очищает все данные покупателя
`validate(): IValidationResult` - выполняет валидацию всех полей и возвращает объект с информацией об ошибках

#### Слой коммуникации
Класс коммуникационного слоя отвечает за обмен данными с сервером — получает массив товаров и отправляет данные о заказе. Он использует композицию: внутри хранит объект класса Api и вызывает его методы get и post.

Конструктор: 
`constructor(api: IApi)` - в конструктор передается объект, реализующий интерфейс IApi (имеет методы get и post)

Методы класса:
`getProducts(): Promise<IProduct[]>` - выполняет GET /product/ через метод get класса Api, возвращает массив товаров (IProduct[])
`sendOrder(data: IOrder): Promise<object>` - выполняет POST /order/ через метод post класса Api, data — объект с информацией о покупателе и выбранных товарах,возвращает результат запроса с сервера

Для товаров используется уже существующий IProduct
Для данных заказа создаём новый тип IOrder в types/index.ts:

```typescript

export interface IOrder extends IBuyer {
    items: string[];
    total: number;
}
```

Для получения данных с сервера ApiListResponse в types/index.ts:

```typescript

export interface ApiListResponse<T> {
    total: number;
    items: T[];
}
```

#### Представления (View)
Классы представления отвечают за отображение данных на странице и взаимодействие с пользователем. Каждый класс представления управляет своим блоком разметки и генерирует события в ответ на действия пользователя.

##### Класс Card (абстрактный)
Родительский класс для всех типов карточек товаров. Содержит общий функционал для отображения информации о товаре.

Наследует: ViewComponent<ICard>

Конструктор: 
`constructor(container: HTMLElement)`

Свойства:
`title: string` - устанавливает название товара
`price: number | null` - устанавливает цену товара (при null отображает "Бесценно")
`category: string` - устанавливает категорию товара с соответствующим стилем
`image: string` - устанавливает изображение товара

##### Класс Form (абстрактный)
Родительский класс для всех форм. Содержит общий функционал для валидации и отображения ошибок.

Наследует: ViewComponent<IForm>

Конструктор:
`constructor(container: HTMLElement)`

Свойства:
`valid: boolean` - управляет состоянием кнопки отправки формы.
`errors: string` - устанавливает текст ошибок валидации.

##### CardCatalog
Отображает карточку товара в галерее каталога. Генерирует событие card:select при клике на карточку.

Наследует: Card<IProduct>

Конструктор: 
`constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void)`

Особенности:
При нулевой цене отключает кнопку и меняет текст на "Недоступно".
Обрабатывает клики для открытия детального просмотра.

##### CardPreview
Отображает детальную информацию о товаре в модальном окне. Содержит кнопку добавления/удаления из корзины.

Наследует: Card<IProduct>

Конструктор:
`constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void)`

Свойства:
`description: string` - устанавливает описание товара.
`buttonText: string` - устанавливает текст кнопки ("Купить" / "Удалить из корзины").
`buttonDisabled: boolean` - управляет состоянием кнопки.

##### CardBasket
Отображает товар в корзине. Содержит кнопку удаления товара из корзины.

Наследует: Card<IProduct>

Конструктор:
`constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void)`

Свойства:
`index: number` - устанавливает порядковый номер товара в корзине.

Особенности:
Использует `event.stopPropagation()` для предотвращения всплытия событий.

##### OrderForm
Форма для ввода адреса доставки и выбора способа оплаты. Валидирует обязательные поля.

Наследует: Form<IBuyer>

Конструктор:
`constructor(container: HTMLFormElement, actions?: IOrderFormActions)`

Свойства:
`payment: string` - устанавливает выбранный способ оплаты.
`address: string` - устанавливает адрес доставки.

Особенности:
Валидирует наличие выбранного способа оплаты и введенного адреса. Генерирует событие при отправке формы.

##### ContactsForm
Форма для ввода контактных данных покупателя. Валидирует обязательные поля.

Наследует: Form<IBuyer>

Конструктор:
`constructor(container: HTMLFormElement, actions?: IContactsFormActions)`

Свойства:
`email: string` - устанавливает email покупателя.
`phone: string` - устанавливает телефон покупателя.

Особенности:
Валидирует наличие email и телефона. Генерирует событие при отправке формы.

##### Modal
Компонент модального окна. Управляет отображением и скрытием модальных окон.

Наследует: Component<IModal>

Конструктор:
`constructor(container: HTMLElement)`

Свойства:
`content: HTMLElement` - устанавливает содержимое модального окна.

Методы:
`open(): void` - открывает модальное окно.
`close(): void` - закрывает модальное окно.

Особенности:
Блокирует скролл страницы при открытии. Не имеет дочерних классов (соответствует требованию задания).

##### BasketView
Представление корзины товаров. Отображает список товаров, общую стоимость и кнопку оформления заказа.

Конструктор: 
`constructor(container: HTMLElement, onClick?: () => void)`

Свойства:
`items: HTMLElement[]` - устанавливает список элементов товаров.
`total: number` - устанавливает общую стоимость.
`selected: boolean` - управляет состоянием кнопки оформления заказа.

##### Success
Компонент успешного оформления заказа. Отображает информацию о заказе и кнопку закрытия.

Конструктор: 
`constructor(container: HTMLElement, onClick?: () => void)`

##### Gallery
Компонент галереи товаров. Отображает сетку карточек товаров.

Свойства:
`cards: HTMLElement[]` - устанавливает список карточек товаров.

##### Header
Компонент заголовка страницы. Содержит счетчик товаров в корзине.

Конструктор: 
`constructor(container: HTMLElement, onClick?: () => void)`

Свойства:
`counter: number` - устанавливает количество товаров в корзине.

#### Презентер (App)
Класс App в файле main.ts реализует роль Презентера в паттерне MVP. Он отвечает за координацию работы всех компонентов приложения, обработку событий и управление бизнес-логикой.

Структура Презентера
Инициализация компонентов:

```typescript

    constructor() {
    this.events = new EventEmitter();
    
    // Инициализация слоя данных
    this.api = new Api(API_URL);
    this.server = new Server(this.api);
    
    // Инициализация моделей
    this.catalog = new ProductCatalog(this.events);
    this.basket = new Basket(this.events);
    this.buyer = new BuyerModel(this.events);
    
    // Инициализация представлений
    this.modal = new Modal(this.ensureElement('#modal-container'));
    this.gallery = new Gallery(this.ensureElement('.gallery'));
    this.header = new Header(
        this.ensureElement('.header'),
        () => this.events.emit('basket:open')
    );
    
    this.setupEventListeners();
    this.loadProducts();
}
```
Обработка событий
Презентер подписывается на все события приложения и реагирует на них:

Обработка событий от моделей:

```typescript

this.events.on('catalog:changed', () => {
    this.renderCatalog();          // Обновить отображение каталога
    this.updateBasketCounter();    // Обновить счетчик корзины
});

this.events.on('basket:changed', () => {
    this.updateBasketCounter();    // Обновить счетчик корзины
});
```

Обработка действий пользователя:

```typescript

// Выбор товара для детального просмотра
this.events.on<CardSelectEvent>('card:select', (data) => {
    const product = this.catalog.getProductById(data.productId);
    if (product) {
        this.catalog.setSelectedProduct(product);
        this.openProductModal(product);  // Открыть модальное окно с товаром
    }
});

// Добавление товара в корзину
this.events.on<CardAddEvent>('card:add', (data) => {
    const product = this.catalog.getProductById(data.productId);
    if (product) {
        this.basket.addItem(product);  // Обновить модель корзины
    }
});

// Оформление заказа
this.events.on<ContactsSubmitEvent>('contacts:submit', (data) => {
    this.buyer.setData({
        email: data.email,
        phone: data.phone
    });
    this.sendOrder();  // Отправить заказ на сервер
});
```
Управление состоянием приложения
Загрузка данных:

```typescript

private async loadProducts() {
    try {
        const products = await this.server.getProducts();
        this.catalog.setProducts(products);  // Обновить модель каталога
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}
```

Отображение каталога:

```typescript

private renderCatalog() {
    const products = this.catalog.getProducts();
    const cards = products.map(product => {
        // Создание CardCatalog для каждого товара
        const card = new CardCatalog(cardElement, () => {
            this.events.emit<CardSelectEvent>('card:select', { productId: product.id });
        });
        
        // Установка данных в представление
        card.title = product.title;
        card.category = product.category;
        card.price = product.price;
        card.image = `${CDN_URL}${product.image}`;
        
        return cardElement;
    });
    
    this.gallery.cards = cards;  // Отображение карточек в галерее
}
```

Работа с модальными окнами:

```typescript

private openProductModal(product: IProduct) {
    // Создание CardPreview для детального отображения
    const card = new CardPreview(modalContent, () => {
        if (this.basket.hasItem(product.id)) {
            this.events.emit<CardRemoveEvent>('card:remove', { productId: product.id });
        } else {
            this.events.emit<CardAddEvent>('card:add', { productId: product.id });
        }
        this.modal.close();
    });
    
    // Настройка представления
    card.title = product.title;
    card.description = product.description;
    card.buttonText = this.basket.hasItem(product.id) ? 'Удалить из корзины' : 'Купить';
    
    this.modal.content = modalContent;
    this.modal.open();
}
```

Отправка заказа:

```typescript

private async sendOrder() {
    try {
        const buyerData = this.buyer.getData();
        const basketItems = this.basket.getItems();
        
        // Валидация данных
        const errors = this.buyer.validate();
        if (Object.keys(errors).length > 0) {
            console.error('Ошибки валидации:', errors);
            return;
        }
        
        // Формирование данных заказа
        const orderData: IOrder = {
            ...buyerData,
            items: basketItems.map(item => item.id),
            total: this.basket.getTotalPrice()
        };
        
        // Отправка на сервер
        const response = await this.server.sendOrder(orderData);
        
        // Показать результат
        this.showSuccessModal(response);
        
        // Очистка состояния
        this.basket.clear();
        this.buyer.clear();
        
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        this.showErrorModal('Не удалось отправить заказ. Попробуйте еще раз.');
    }
}
```

Преимущества архитектуры с Презентером:
1. Разделение ответственности: Презентер знает о существовании моделей и представлений, но модели и представления не знают друг о друге.
2. Гибкость: Легко заменить любое представление или модель без изменения бизнес-логики.
3. Тестируемость: Бизнес-логика в Презентере может быть протестирована отдельно от UI.
4. Масштабируемость: Новые функции добавляются через новые события и их обработчики.
5. Согласованность: Все изменения состояния координируются через единый центр (Презентер).

Запуск приложения:

```typescript

document.addEventListener('DOMContentLoaded', () => {
    new App();  // Создание и инициализация Презентера
});
```