import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

interface CatalogChangedEvent {
    products: IProduct[];
}

interface CatalogSelectedEvent {
    product: IProduct | null;
}

export class ProductCatalog {
    protected products: IProduct[] = [];
    protected selectedProduct: IProduct | null = null;

    constructor(protected events: IEvents) {}

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.events.emit<CatalogChangedEvent>('catalog:changed', { products: this.products });
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit<CatalogSelectedEvent>('catalog:selected', { product: this.selectedProduct });
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}