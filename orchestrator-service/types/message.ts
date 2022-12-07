export interface MessageFromKafka{
    service: string;
    transactionId: string;
    message: string;
    type: boolean;
    data: any;
    step: number;
}