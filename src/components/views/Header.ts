import { ViewComponent } from '../views/BaseComponent';

interface IHeader {
    counter: number;
    onClick: () => void;
}

export class Header extends ViewComponent<IHeader> {
    protected _counterElement: HTMLElement;
    protected _basketButton: HTMLButtonElement;

    constructor(container: HTMLElement, onClick?: () => void) {
        super(container);
        
        this._counterElement = this.ensureElement<HTMLElement>('.header__basket-counter');
        this._basketButton = this.ensureElement<HTMLButtonElement>('.header__basket');
        
        if (onClick) {
            this._basketButton.addEventListener('click', onClick);
        }
    }

    set counter(value: number) {
        this.setText(this._counterElement, String(value));
    }
}