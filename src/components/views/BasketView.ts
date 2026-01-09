import { ViewComponent } from './BaseComponent';

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: boolean;
    onClick: () => void;
}

export class BasketView extends ViewComponent<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, onClick?: () => void) {
        super(container);
        
        console.log('BasketView инициализирован'); // Добавляем лог
        
        this._list = this.ensureElement<HTMLElement>('.basket__list');
        this._total = this.ensureElement<HTMLElement>('.basket__price');
        this._button = this.ensureElement<HTMLButtonElement>('.basket__button');
        
        console.log('Элементы найдены:', { 
            list: !!this._list, 
            total: !!this._total, 
            button: !!this._button 
        });
        
        if (onClick) {
            this._button.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Клик по кнопке basket__button');
                onClick();
            });
        }
    }

    set items(value: HTMLElement[]) {
        console.log('Установка items в BasketView:', value.length);
        if (value.length) {
            this._list.replaceChildren(...value);
        } else {
            this._list.innerHTML = '<p class="basket__empty">Корзина пуста</p>';
        }
    }

    set total(value: number) {
        console.log('Установка total в BasketView:', value);
        this.setText(this._total, `${value} синапсов`);
    }

    set selected(value: boolean) {
        console.log('Установка selected в BasketView:', value);
        this.setDisabled(this._button, !value);
    }
}