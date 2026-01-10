import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { Server } from './components/communication/Server';
import { ProductCatalog } from './components/models/ProductCatalog';
import { Basket } from './components/models/Basket';
import { BuyerModel } from './components/models/BuyerModel';
import { 
    CardCatalog, 
    CardPreview, 
    CardBasket, 
    Modal, 
    BasketView, 
    OrderForm, 
    ContactsForm, 
    Success, 
    Gallery, 
    Header 
} from './components/views';
import { IProduct, IOrder, IOrderResponse } from './types';

// Типы событий
interface CardSelectEvent { productId: string; }
interface CardAddEvent { productId: string; }
interface CardRemoveEvent { productId: string; }
interface BasketRemoveEvent { productId: string; }
interface OrderInputEvent { field: string; value: string; }
interface ContactsInputEvent { field: string; value: string; }

class App {
    private events: EventEmitter;
    private api: Api;
    private server: Server;
    
    private catalog: ProductCatalog;
    private basket: Basket;
    private buyer: BuyerModel;
    
    private modal: Modal;
    private gallery: Gallery;
    private header: Header;
    
    private basketView?: BasketView;
    private orderForm?: OrderForm;
    private contactsForm?: ContactsForm;
    private successView?: Success;
    
    private templates: Map<string, HTMLTemplateElement> = new Map();

    constructor() {
        this.events = new EventEmitter();
        
        this.api = new Api(API_URL);
        this.server = new Server(this.api);
        
        this.catalog = new ProductCatalog(this.events);
        this.basket = new Basket(this.events);
        this.buyer = new BuyerModel(this.events);
        
        this.loadTemplates();
        
        this.modal = new Modal(ensureElement('#modal-container'));
        this.gallery = new Gallery(ensureElement('.gallery'));
        this.header = new Header(
            ensureElement('.header'),
            () => this.events.emit('basket:open')
        );
        
        this.setupEventListeners();
        this.loadProducts();
    }
    
    private loadTemplates() {
        const templateIds = [
            'card-catalog', 'card-preview', 'card-basket',
            'basket', 'order', 'contacts', 'success'
        ];
        
        templateIds.forEach(id => {
            const template = document.getElementById(id) as HTMLTemplateElement;
            if (template) {
                this.templates.set(id, template);
            }
        });
    }
    
    private setupEventListeners() {
        this.events.on('catalog:changed', () => {
            this.renderCatalog();
            this.updateBasketCounter();
        });
        
        this.events.on('basket:changed', () => {
            this.updateBasketCounter();
            // Обновляем представление корзины, если оно открыто
            if (this.basketView && this.modal.isOpen()) {
                this.updateBasketView();
            }
        });
        
        this.events.on<CardSelectEvent>('card:select', (data) => {
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.openProductModal(product);
            }
        });
        
        this.events.on('basket:open', () => {
            this.openBasketModal();
        });
        
        this.events.on<CardAddEvent>('card:add', (data) => {
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.basket.addItem(product);
            }
        });
        
        this.events.on<CardRemoveEvent>('card:remove', (data) => {
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.basket.removeItem(product);
            }
        });
        
        this.events.on<BasketRemoveEvent>('basket:remove', (data) => {
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.basket.removeItem(product);
            }
        });
        
        this.events.on('basket:submit', () => {
            this.openOrderModal();
        });
        
        this.events.on<OrderInputEvent>('order:input', (data) => {
            this.buyer.setData({ [data.field]: data.value });
        });
        
        this.events.on<ContactsInputEvent>('contacts:input', (data) => {
            this.buyer.setData({ [data.field]: data.value });
        });
        
        this.events.on('order:submit', () => {
            const errors = this.buyer.validate();
            const buyerData = this.buyer.getData();
            
            if (!errors.payment && !errors.address && buyerData.payment && buyerData.address) {
                this.openContactsModal();
            }
        });
        
        this.events.on('contacts:submit', () => {
            const errors = this.buyer.validate();
            const buyerData = this.buyer.getData();
            
            if (!errors.email && !errors.phone && buyerData.email && buyerData.phone) {
                this.sendOrder();
            }
        });
        
        this.events.on('buyer:changed', () => {
            this.updateForms();
        });
        
        this.events.on('success:close', () => {
            this.modal.close();
        });
    }
    
    private async loadProducts() {
        try {
            const products = await this.server.getProducts();
            this.catalog.setProducts(products);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        }
    }
    
    private renderCatalog() {
        const products = this.catalog.getProducts();
        const cards = products.map(product => {
            const template = this.templates.get('card-catalog');
            if (!template) return null;
            
            const cardElement = cloneTemplate<HTMLElement>(template);
            const card = new CardCatalog(cardElement, () => {
                this.events.emit<CardSelectEvent>('card:select', { productId: product.id });
            });
            
            card.title = product.title;
            card.category = product.category;
            card.price = product.price;
            card.image = `${CDN_URL}${product.image}`;
            
            return cardElement;
        }).filter(Boolean) as HTMLElement[];
        
        this.gallery.cards = cards;
    }
    
    private updateBasketCounter() {
        const count = this.basket.getItemsCount();
        this.header.counter = count;
    }
    
    private updateForms() {
        const buyerData = this.buyer.getData();
        const errors = this.buyer.getErrors();
        
        if (this.orderForm) {
            this.orderForm.payment = buyerData.payment || '';
            this.orderForm.address = buyerData.address;

            this.orderForm.valid = !errors.payment && !errors.address;
            if (errors.payment || errors.address) {
                const errorMessages = [errors.payment, errors.address].filter(Boolean);
                this.orderForm.errors = errorMessages.join('. ');
            } else {
                this.orderForm.errors = '';
            }
        }
        
        if (this.contactsForm) {
            this.contactsForm.email = buyerData.email;
            this.contactsForm.phone = buyerData.phone;
            
            this.contactsForm.valid = !errors.email && !errors.phone;
            if (errors.email || errors.phone) {
                const errorMessages = [errors.email, errors.phone].filter(Boolean);
                this.contactsForm.errors = errorMessages.join('. ');
            } else {
                this.contactsForm.errors = '';
            }
        }
    }
    
    private openProductModal(product: IProduct) {
        const template = this.templates.get('card-preview');
        if (!template) return;
        
        const modalContent = cloneTemplate<HTMLElement>(template);
        const card = new CardPreview(modalContent, () => {
            if (this.basket.hasItem(product.id)) {
                this.events.emit<CardRemoveEvent>('card:remove', { productId: product.id });
            } else {
                this.events.emit<CardAddEvent>('card:add', { productId: product.id });
            }
            this.modal.close();
        });
        
        card.title = product.title;
        card.category = product.category;
        card.price = product.price;
        card.image = `${CDN_URL}${product.image}`;
        card.description = product.description;
        card.buttonText = this.basket.hasItem(product.id) ? 'Удалить из корзины' : 'Купить';
        card.buttonDisabled = product.price === null;
        
        this.modal.content = modalContent;
        this.modal.open();
    }
    
    private openBasketModal() {
        const template = this.templates.get('basket');
        if (!template) return;

        if (!this.basketView) {
            const basketContent = cloneTemplate<HTMLElement>(template);
            this.basketView = new BasketView(basketContent, () => {
                this.events.emit('basket:submit');
            });
        }
        
        this.updateBasketView();
        this.modal.content = (this.basketView as any).container;
        this.modal.open();
    }
    
    private updateBasketView() {
        if (!this.basketView) return;
        
        const items = this.basket.getItems().map((product, index) => {
            const itemTemplate = this.templates.get('card-basket');
            if (!itemTemplate) return null;
            
            const itemElement = cloneTemplate<HTMLElement>(itemTemplate);
            const card = new CardBasket(itemElement, () => {
                this.events.emit<BasketRemoveEvent>('basket:remove', { productId: product.id });
            });
            
            card.title = product.title;
            card.price = product.price;
            card.index = index + 1;
            
            return itemElement;
        }).filter(Boolean) as HTMLElement[];
        
        this.basketView.items = items;
        this.basketView.total = this.basket.getTotalPrice();
        this.basketView.selected = items.length > 0;
    }
    
    private openOrderModal() {
        const template = this.templates.get('order');
        if (!template) return;

        if (!this.orderForm) {
            const orderContent = cloneTemplate<HTMLElement>(template);
            const formElement = orderContent as unknown as HTMLFormElement;
            this.orderForm = new OrderForm(formElement, this.events);
        }

        const buyerData = this.buyer.getData();
        this.orderForm.payment = buyerData.payment || '';
        this.orderForm.address = buyerData.address;

        this.modal.content = (this.orderForm as any).container;
        this.modal.open();
    }
    
    private openContactsModal() {
        const template = this.templates.get('contacts');
        if (!template) return;

        if (!this.contactsForm) {
            const contactsContent = cloneTemplate<HTMLElement>(template);
            const formElement = contactsContent as unknown as HTMLFormElement;
            this.contactsForm = new ContactsForm(formElement, this.events);
        }

        const buyerData = this.buyer.getData();
        this.contactsForm.email = buyerData.email;
        this.contactsForm.phone = buyerData.phone;

        this.modal.content = (this.contactsForm as any).container;
        this.modal.open();
    }
    
    private async sendOrder() {
        try {
            const buyerData = this.buyer.getData();
            const basketItems = this.basket.getItems();
            
            const errors = this.buyer.validate();
            if (Object.keys(errors).length > 0) {
                console.error('Ошибки валидации:', errors);
                return;
            }
            
            if (basketItems.length === 0) {
                console.error('Корзина пуста');
                return;
            }
            
            const orderData: IOrder = {
                ...buyerData,
                items: basketItems.map(item => item.id),
                total: this.basket.getTotalPrice()
            };
            
            const response = await this.server.sendOrder(orderData);
            this.showSuccessModal(response);
            
            this.basket.clear();
            this.buyer.clear();
            
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            this.showErrorModal('Не удалось отправить заказ. Попробуйте еще раз.');
        }
    }
    
    private showSuccessModal(orderResponse: IOrderResponse) {
        const template = this.templates.get('success');
        if (!template) return;
        
        if (!this.successView) {
            const successContent = cloneTemplate<HTMLElement>(template);
            this.successView = new Success(successContent, () => {
                this.events.emit('success:close');
            });
        }
        
        this.successView.description = 
            `Заказ #${orderResponse.id} оформлен на сумму ${orderResponse.total} синапсов`;

        this.modal.content = (this.successView as any).container;
        this.modal.open();
    }
    
    private showErrorModal(message: string) {
        const template = this.templates.get('success');
        if (!template) return;
        
        const modalContent = cloneTemplate<HTMLElement>(template);
        
        const errorView = new Success(modalContent, () => {
            this.modal.close();
        });
        
        errorView.description = message;
        
        this.modal.content = modalContent;
        this.modal.open();
    }
}

// Запуск приложения
new App();