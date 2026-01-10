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

        this.validateForm();
    }
    
    private validateForm(): boolean {
        const buyerData = this.getFormData();
        let isValid = true;
        
        if (!buyerData.payment) {
            isValid = false;
        }
        
        if (!buyerData.address) {
            isValid = false;
        }
        
        this.valid = isValid;
        return isValid;
    }
    
    private getFormData(): { payment: string; address: string } {
        const paymentButton = this.container.querySelector('.button_alt-active');
        return {
            payment: paymentButton ? paymentButton.getAttribute('name') || '' : '',
            address: this._addressInput.value.trim()
        };
    }

    set payment(value: string) {
        this._paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.name === value);
        });
        this.validateForm();
    }

    set address(value: string) {
        this._addressInput.value = value;
        this.validateForm();
    }
}