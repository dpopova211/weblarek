import { ViewComponent } from './BaseComponent';
import { ensureElement } from '../../utils/utils';

interface IForm {
    valid: boolean;
    errors: string;
}

export abstract class Form<T> extends ViewComponent<IForm> {
    protected _errors: HTMLElement;
    protected _submitButton: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this._errors = ensureElement<HTMLElement>('.form__errors', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    }

    set valid(value: boolean) {
        this.setDisabled(this._submitButton, !value);
    }

    set errors(value: string) {
        this.setText(this._errors, value);
        if (value) {
            this._errors.style.display = 'block';
        } else {
            this._errors.style.display = 'none';
        }
    }
}