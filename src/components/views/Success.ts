import { ViewComponent } from './BaseComponent';

interface ISuccess {
    onClick: () => void;
}

export class Success extends ViewComponent<ISuccess> {
    protected _closeButton: HTMLButtonElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, onClick?: () => void) {
        super(container);
        
        this._closeButton = this.ensureElement<HTMLButtonElement>('.order-success__close');
        this._description = this.ensureElement<HTMLElement>('.order-success__description');
        
        if (onClick) {
            this._closeButton.addEventListener('click', onClick);
        }
    }

    // Устанавливаем описание
    setDescription(text: string) {
        this.setText(this._description, text);
    }
}