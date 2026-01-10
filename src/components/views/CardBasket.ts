import { Card } from './Card';
import { IProduct } from '../../types';

export class CardBasket extends Card<IProduct> {
    protected _button: HTMLButtonElement;
    protected _index: HTMLElement;

    constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void) {
        super(container);
        
        this._button = this.ensureElement<HTMLButtonElement>('.basket__item-delete');
        this._index = this.ensureElement<HTMLElement>('.basket__item-index');
        
        if (onClick && this._button) {
            this._button.addEventListener('click', (event) => {
                event.stopPropagation(); // Важно!
                onClick(event);
            });
        }
    }

    set index(value: number) {
        this.setText(this._index, String(value));
    }
}