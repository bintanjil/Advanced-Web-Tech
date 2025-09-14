export declare class PusherService {
    private pusher;
    constructor();
    trigger(channel: string, event: string, data: any): Promise<void>;
    triggerBatch(events: {
        channel: string;
        event: string;
        data: any;
    }[]): Promise<void>;
}
