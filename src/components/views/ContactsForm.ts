import { Form } from './Form';
import { ensureElement } from '../../utils/utils';
import { IBuyer } from '../../types';

interface IContactsFormActions {
    onSubmit: (event: Event) => void;
}

export class ContactsForm extends Form<IBuyer> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(container: HTMLFormElement, actions?: IContactsFormActions) {
        super(container);
        
        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        this._errors = ensureElement<HTMLElement>('.form__errors', container);
        
        if (actions?.onSubmit) {
            container.addEventListener('submit', (event) => {
                event.preventDefault();
                
                if (this.validate()) {
                    actions.onSubmit(event);
                }
            });
        }
        
        this._emailInput.addEventListener('input', () => {
            this.validate();
        });
        
        this._phoneInput.addEventListener('input', () => {
            this.validate();
        });
        
        this.validate();
    }
    
    private validate(): boolean {
        let errorMessages: string[] = [];
        
        const emailValue = this._emailInput.value.trim();
        if (!emailValue) {
            errorMessages.push('Введите email');
        }
        
        const phoneValue = this._phoneInput.value.trim();
        if (!phoneValue) {
            errorMessages.push('Введите телефон');
        }
        
        const isValid = errorMessages.length === 0;
        
        this.setDisabled(this._submitButton, !isValid);
        
        if (errorMessages.length > 0) {
            this.errors = errorMessages.join('. ');
        } else {
            this.errors = '';
        }
        
        return isValid;
    }

    set email(value: string) {
        this._emailInput.value = value;
        this.validate();
    }

    set phone(value: string) {
        this._phoneInput.value = value;
        this.validate();
    }
}