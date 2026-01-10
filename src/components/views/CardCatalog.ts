import { Card } from './Card';
import { IProduct } from '../../types';

export class CardCatalog extends Card<IProduct> {
    constructor(container: HTMLElement, onClick?: (event: MouseEvent) => void) {
        super(container);
        
        if (onClick) {
            this.container.addEventListener('click', onClick);
            this.container.style.cursor = 'pointer';
        }
    }

    set price(value: number | null) {
        super.price = value;
    }
}