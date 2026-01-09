import { IBuyer, TPayment } from '../../types';
import { IEvents } from '../base/Events';

interface BuyerChangedEvent {
    data: IBuyer;
}

export class BuyerModel {
    protected payment: TPayment = null;
    protected email = '';
    protected phone = '';
    protected address = '';

    constructor(protected events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.address !== undefined) this.address = data.address;
        
        this.events.emit<BuyerChangedEvent>('buyer:changed', { data: this.getData() });
    }

    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clear(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';
        
        this.events.emit<BuyerChangedEvent>('buyer:changed', { data: this.getData() });
    }

    validate(): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!this.payment) {
            errors.payment = 'Не выбран вид оплаты';
        }

        if (!this.email) {
            errors.email = 'Укажите email';
        }

        if (!this.phone) {
            errors.phone = 'Укажите телефон';
        }

        if (!this.address) {
            errors.address = 'Укажите адрес';
        }

        return errors;
    }
}