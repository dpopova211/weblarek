import { Card } from './Card';
import { IProduct } from '../../types';

export class CardCatalog extends Card<IProduct> {
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void) {
        super(container);
        
        this._button = this.container as HTMLButtonElement;
        
        if (onClick) {
            this._button.addEventListener('click', onClick);
        }
    }

    set price(value: number | null) {
        super.price = value;
        
        if (value === null) {
            this.setDisabled(this._button, true);
            this.setText(this._button, 'Недоступно');
        }
    }
}