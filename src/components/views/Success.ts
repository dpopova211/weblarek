import { ViewComponent } from '../views/BaseComponent';

interface ISuccess {
    description: string;
}

export class Success extends ViewComponent<ISuccess> {
    protected _description: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, onClick?: () => void) {
        super(container);
        
        this._description = this.ensureElement<HTMLElement>('.order-success__description');
        this._closeButton = this.ensureElement<HTMLButtonElement>('.order-success__close');
        
        if (onClick) {
            this._closeButton.addEventListener('click', onClick);
        }
    }

    set description(value: string) {
        this.setText(this._description, value);
    }
}