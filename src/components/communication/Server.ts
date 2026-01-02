import { IApi, IProduct, IOrder, ApiListResponse, IOrderResponse } from '../../types';

export class Server {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    // Получает массив товаров
    async getProducts(): Promise<IProduct[]> {
        const data = await this.api.get<ApiListResponse<IProduct>>('/product/');
        return data.items;
    }

    // Отправляет заказ
    async sendOrder(orderData: IOrder): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order/', orderData);
    }
}