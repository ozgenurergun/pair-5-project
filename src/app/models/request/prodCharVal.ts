export type ProductCharValueList = ProdCharVal[]

export interface ProdCharVal{
    charVal: CharValue[];
    product: Product;
}

export interface CharValue{
    id?: number;
    characteristicId: number;
    value?: string;
}

export interface Product{
    name: string;
    price: number;
}
