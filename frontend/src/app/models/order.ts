export interface OrderItem {
	productId: string;
	name: string;
	price: number;
	quantity: number;
}

export interface Order {
	_id?: string;
	customerId?: string;
	customerName: string;
	email: string;
	items: OrderItem[];
	total: number;
	status: string;
	stripeSessionId?: string;
	createdAt?: string;
}
