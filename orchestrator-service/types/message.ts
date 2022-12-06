export interface MessageFromKafka{
    transactionId: string;
    message: string;
    type: boolean;
    data: any;
}