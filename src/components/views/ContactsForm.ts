import { Form } from './Form';
import { IBuyer } from '../../types';
import { IEvents } from '../base/Events';

export class ContactsForm extends Form<IBuyer> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container);
        
        this._emailInput = this.ensureElement<HTMLInputElement>('input[name="email"]');
        this._phoneInput = this.ensureElement<HTMLInputElement>('input[name="phone"]');
        
        container.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            events.emit('contacts:submit');
        });
        
        this._emailInput.addEventListener('input', () => {
            events.emit('contacts:input', { 
                field: 'email', 
                value: this._emailInput.value 
            });
        });
        
        this._phoneInput.addEventListener('input', () => {
            events.emit('contacts:input', { 
                field: 'phone', 
                value: this._phoneInput.value 
            });
        });
        
        this.validateForm();
    }
    
    private validateForm(): boolean {
        const email = this._emailInput.value.trim();
        const phone = this._phoneInput.value.trim();
        let isValid = true;
        
        if (!email) {
            isValid = false;
        }
        
        if (!phone) {
            isValid = false;
        }
        
        this.valid = isValid;
        return isValid;
    }

    set email(value: string) {
        this._emailInput.value = value;
        this.validateForm();
    }

    set phone(value: string) {
        this._phoneInput.value = value;
        this.validateForm();
    }
}