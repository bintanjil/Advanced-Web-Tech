import { ConfigService } from '@nestjs/config';
export declare class PusherService {
    private configService;
    private pusher;
    constructor(configService: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
    triggerBatch(events: {
        channel: string;
        event: string;
        data: any;
    }[]): Promise<void>;
}
