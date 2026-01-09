import { Card } from './Card';
import { IProduct } from '../../types';

export class CardPreview extends Card<IProduct> {
    protected _button: HTMLButtonElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void) {
        super(container);
        
        this._button = this.ensureElement<HTMLButtonElement>('.card__button');
        this._description = this.ensureElement<HTMLElement>('.card__text');
        
        if (onClick) {
            this._button.addEventListener('click', onClick);
        }
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set buttonText(value: string) {
        this.setText(this._button, value);
    }

    set buttonDisabled(value: boolean) {
        this.setDisabled(this._button, value);
    }
}