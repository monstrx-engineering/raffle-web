export interface Sales {
	price: Price;
	supply: { remaining: number; max: number };
	endDate: Date | string | number;
}

export interface Creator {
	name: string;
	avatar: string;
}
