import { IApi, IProduct, IOrder, ApiListResponse, IOrderResponse } from '../../types';

export class Server {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    // Получает массив товаров
    async getProducts(): Promise<IProduct[]> {
        try {
            console.log('Запрос товаров с сервера...');
            const data = await this.api.get<ApiListResponse<IProduct>>('/product/');
            console.log('Товары получены:', data.items.length, 'шт.');
            return data.items;
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            throw error;
        }
    }

    // Отправляет заказ
    async sendOrder(orderData: IOrder): Promise<IOrderResponse> {
        try {
            console.log('Отправка заказа на сервер:', orderData);
            const response = await this.api.post<IOrderResponse>('/order/', orderData);
            console.log('Заказ успешно отправлен, ID:', response.id);
            return response;
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            throw error;
        }
    }
}