import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';
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
interface OrderSubmitEvent { payment: string; address: string; }
interface ContactsSubmitEvent { email: string; phone: string; }

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
    
    private templates: Map<string, HTMLTemplateElement> = new Map();

    constructor() {
        this.events = new EventEmitter();
        
        this.api = new Api(API_URL);
        this.server = new Server(this.api);
        
        this.catalog = new ProductCatalog(this.events);
        this.basket = new Basket(this.events);
        this.buyer = new BuyerModel(this.events);
        
        this.loadTemplates();
        
        this.modal = new Modal(this.ensureElement('#modal-container'));
        this.gallery = new Gallery(this.ensureElement('.gallery'));
        this.header = new Header(
            this.ensureElement('.header'),
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
    
    private ensureElement<T extends HTMLElement>(selector: string): T {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        return element as T;
    }
    
    private setupEventListeners() {
        this.events.on('catalog:changed', () => {
            this.renderCatalog();
            this.updateBasketCounter();
        });
        
        this.events.on('basket:changed', () => {
            this.updateBasketCounter();
        });
        
        this.events.on<CardSelectEvent>('card:select', (data) => {
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.catalog.setSelectedProduct(product);
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
            console.log('Удаляем товар с ID:', data.productId);
            
            const product = this.catalog.getProductById(data.productId);
            if (product) {
                this.basket.removeItem(product);
                this.modal.close();
                setTimeout(() => this.openBasketModal(), 0);
            }
        });
        
        this.events.on('basket:submit', () => {
            this.openOrderModal();
        });
        
        this.events.on<OrderSubmitEvent>('order:submit', (data) => {
            this.buyer.setData({
                payment: data.payment as 'cash' | 'card',
                address: data.address
            });
            this.openContactsModal();
        });
        
        this.events.on<ContactsSubmitEvent>('contacts:submit', (data) => {
            this.buyer.setData({
                email: data.email,
                phone: data.phone
            });
            this.sendOrder();
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
            
            cardElement.dataset.id = product.id;
            
            return cardElement;
        }).filter(Boolean) as HTMLElement[];
        
        this.gallery.cards = cards;
    }
    
    private updateBasketCounter() {
        const count = this.basket.getItemsCount();
        this.header.counter = count;
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
        if (!template) {
            console.error('Шаблон basket не найден');
            return;
        }
               
        const modalContent = cloneTemplate<HTMLElement>(template);
        
        const basketView = new BasketView(modalContent, () => {
            this.events.emit('basket:submit');
        });
        
        const items = this.basket.getItems().map((product, index) => {
            const itemTemplate = this.templates.get('card-basket');
            if (!itemTemplate) {
                console.error('Шаблон card-basket не найден');
                return null;
            }
            
            const itemElement = cloneTemplate<HTMLElement>(itemTemplate);
            const card = new CardBasket(itemElement, () => {
                this.events.emit<BasketRemoveEvent>('basket:remove', { productId: product.id });
            });
            
            card.title = product.title;
            card.price = product.price;
            card.index = index + 1;
            
            itemElement.dataset.id = product.id;
            
            return itemElement;
        }).filter(Boolean) as HTMLElement[];
               
        basketView.items = items;
        basketView.total = this.basket.getTotalPrice();
        basketView.selected = items.length > 0;
        
        this.modal.content = modalContent;
        this.modal.open();
    }
    
    private openOrderModal() {
        const template = this.templates.get('order');
        if (!template) return;
        
        const modalContent = cloneTemplate<HTMLElement>(template);
        const formElement = modalContent as unknown as HTMLFormElement;
        
        const orderForm = new OrderForm(formElement, {
            onSubmit: (event: Event) => {
                event.preventDefault();
                
                const paymentButton = modalContent.querySelector('.button_alt-active');
                const addressInput = modalContent.querySelector('input[name="address"]') as HTMLInputElement;
                
                if (paymentButton && addressInput.value) {
                    this.events.emit<OrderSubmitEvent>('order:submit', {
                        payment: paymentButton.getAttribute('name') || '',
                        address: addressInput.value
                    });
                }
            }
        });
        
        const buyerData = this.buyer.getData();
        if (buyerData.payment) {
            orderForm.payment = buyerData.payment;
        }
        if (buyerData.address) {
            orderForm.address = buyerData.address;
        }
        
        this.modal.content = modalContent;
        this.modal.open();
    }
    
    private openContactsModal() {
        const template = this.templates.get('contacts');
        if (!template) return;
        
        const modalContent = cloneTemplate<HTMLElement>(template);
        const formElement = modalContent as unknown as HTMLFormElement;
        
        const contactsForm = new ContactsForm(formElement, {
            onSubmit: (event: Event) => {
                event.preventDefault();
                
                const emailInput = modalContent.querySelector('input[name="email"]') as HTMLInputElement;
                const phoneInput = modalContent.querySelector('input[name="phone"]') as HTMLInputElement;
                
                if (emailInput.value && phoneInput.value) {
                    this.events.emit<ContactsSubmitEvent>('contacts:submit', {
                        email: emailInput.value,
                        phone: phoneInput.value
                    });
                }
            }
        });
        
        const buyerData = this.buyer.getData();
        if (buyerData.email) {
            contactsForm.email = buyerData.email;
        }
        if (buyerData.phone) {
            contactsForm.phone = buyerData.phone;
        }
        
        this.modal.content = modalContent;
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
        
        const modalContent = cloneTemplate<HTMLElement>(template);
        
        new Success(modalContent, () => {
            this.events.emit('success:close');
        });
        
        const descriptionElement = modalContent.querySelector('.order-success__description');
        if (descriptionElement) {
            descriptionElement.textContent = 
                `Заказ #${orderResponse.id} оформлен на сумму ${orderResponse.total} синапсов`;
        }
        
        this.modal.content = modalContent;
        this.modal.open();
    }

    private showErrorModal(message: string) {
        const errorContent = document.createElement('div');
        errorContent.innerHTML = `
            <div class="order-success" style="text-align: center;">
                <h2 class="order-success__title" style="color: #dc3545;">Ошибка</h2>
                <p class="order-success__description">${message}</p>
                <button class="button order-success__close">Понятно</button>
            </div>
        `;
        
        const closeButton = errorContent.querySelector('.order-success__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.modal.close();
            });
        }
        
        this.modal.content = errorContent;
        this.modal.open();
    }
}
// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});