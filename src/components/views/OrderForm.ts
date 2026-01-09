import { Form } from './Form';
import { ensureElement } from '../../utils/utils';
import { IBuyer } from '../../types';

interface IOrderFormActions {
    onSubmit: (event: Event) => void;
}

export class OrderForm extends Form<IBuyer> {
    protected _paymentButtons: NodeListOf<HTMLButtonElement>;
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(container: HTMLFormElement, actions?: IOrderFormActions) {
        super(container);
        
        this._paymentButtons = container.querySelectorAll('.button_alt');
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
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
        
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this._paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
                button.classList.add('button_alt-active');
                this.validate();
            });
        });
        
        this._addressInput.addEventListener('input', () => {
            this.validate();
        });
        
        this.validate();
    }
    
    private validate(): boolean {
        let errorMessages: string[] = [];

        const hasPayment = !!this.container.querySelector('.button_alt-active');
        if (!hasPayment) {
            errorMessages.push('Выберите способ оплаты');
        }

        const addressValue = this._addressInput.value.trim();
        if (!addressValue) {
            errorMessages.push('Введите адрес доставки');
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

    set payment(value: string) {
        this._paymentButtons.forEach(button => {
            if (button.name === value) {
                button.classList.add('button_alt-active');
            } else {
                button.classList.remove('button_alt-active');
            }
        });
        this.validate();
    }

    set address(value: string) {
        this._addressInput.value = value;
        this.validate();
    }
}