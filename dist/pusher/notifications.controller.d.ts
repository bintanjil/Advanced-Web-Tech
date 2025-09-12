import { PusherService } from './pusher.service';
export declare class NotificationsController {
    private readonly pusherService;
    constructor(pusherService: PusherService);
    authenticatePusher(): Promise<{
        authenticated: boolean;
    }>;
}
