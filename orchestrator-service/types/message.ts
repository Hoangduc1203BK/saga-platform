export interface MessageFromKafka{
    service: string;
    transactionId: string;
    message: string;
    type: MESSAGE_TYPE;
    data: any;
    step: number;
}

export enum MESSAGE_TYPE {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL",
}