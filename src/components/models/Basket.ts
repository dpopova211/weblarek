import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

interface BasketChangedEvent {
    items: IProduct[];
}

export class Basket {
    protected items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
        this.events.emit<BasketChangedEvent>('basket:changed', { items: this.items });
    }

    removeItem(product: IProduct): void {
        this.items = this.items.filter(item => item.id !== product.id);
        this.events.emit<BasketChangedEvent>('basket:changed', { items: this.items });
    }

    clear(): void {
        this.items = [];
        this.events.emit<BasketChangedEvent>('basket:changed', { items: this.items });
    }

    getTotalPrice(): number {
        return this.items.reduce((total, item) => {
            return total + (item.price ?? 0);
        }, 0);
    }

    getItemsCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some(item => item.id === id);
    }
}