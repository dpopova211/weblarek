import { IBuyer, TPayment } from '../../types';

export class BuyerModel {
    protected payment: TPayment | null = null;
    protected email = '';
    protected phone = '';
    protected address = '';

    constructor() {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.address !== undefined) this.address = data.address;
    }

    getData(): IBuyer {
        return {
            payment: this.payment as TPayment,
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
