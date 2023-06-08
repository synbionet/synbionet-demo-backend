
export type CommonInfo = {
    id: number,
    when: number,
    uri?: string,
}

export type ServiceInfo = {
    owner?: string,
    name?: string,
    active?: boolean,
} & CommonInfo;

export enum ExchangeState {
    Offered,
    Funded,
    Disputed,
    Resolved,
    Completed,
    Voided
}

export type ExchangeInfo = {
    serviceId?: number,
    state: ExchangeState,
    buyer?: string,
    seller?: string,
    moderator?: string,
    price?: number,
    refundType?: number,
    signer?: string,
} & CommonInfo;

export type EventContainer = {
    event: string,
    data: ServiceInfo | ExchangeInfo
}



