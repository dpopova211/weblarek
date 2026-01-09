import { ViewComponent } from '../views/BaseComponent';
import { categoryMap } from '../../utils/constants';

interface ICard {
    title: string;
    category?: string;
    image?: string;
    price: number | null;
}

export abstract class Card<T> extends ViewComponent<ICard> {
    protected _category?: HTMLElement;
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _price: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this._title = this.ensureElement<HTMLElement>('.card__title');
        this._price = this.ensureElement<HTMLElement>('.card__price');
        
        this._category = this.container.querySelector('.card__category');
        this._image = this.container.querySelector<HTMLImageElement>('.card__image');
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    set category(value: string) {
        if (this._category) {
            this.setText(this._category, value);
            
            Object.keys(categoryMap).forEach(cat => {
                this._category.classList.remove(categoryMap[cat]);
            });
            
            if (categoryMap[value]) {
                this._category.classList.add(categoryMap[value]);
            }
        }
    }

    set image(value: string) {
        if (this._image) {
            this.setImage(this._image, value);
        }
    }
}