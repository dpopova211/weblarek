import { Form } from './Form';
import { IBuyer } from '../../types';
import { IEvents } from '../base/Events';

export class OrderForm extends Form<IBuyer> {
    protected _paymentButtons: NodeListOf<HTMLButtonElement>;
    protected _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container);
        
        this._paymentButtons = container.querySelectorAll('.button_alt');
        this._addressInput = this.ensureElement<HTMLInputElement>('input[name="address"]');
        
        container.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            events.emit('order:submit');
        });

        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                events.emit('order:input', { 
                    field: 'payment', 
                    value: button.getAttribute('name') || '' 
                });
            });
        });
        
        this._addressInput.addEventListener('input', () => {
            events.emit('order:input', { 
                field: 'address', 
                value: this._addressInput.value 
            });
        });
    }

    set payment(value: string) {
        this._paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.name === value);
        });
    }

    set address(value: string) {
        this._addressInput.value = value;
    }
}