"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const Pusher = require("pusher");
let PusherService = class PusherService {
    pusher;
    constructor() {
        this.pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID || '2050466',
            key: process.env.PUSHER_KEY || 'cdfc8abb8d9230af175c',
            secret: process.env.PUSHER_SECRET || '8174bc301577c834f223',
            cluster: process.env.PUSHER_CLUSTER || 'ap1',
            useTLS: true,
        });
    }
    async trigger(channel, event, data) {
        try {
            const eventData = {
                ...data,
                timestamp: new Date().toISOString()
            };
            await this.pusher.trigger(channel, event, eventData);
            console.log('Successfully triggered Pusher event:', {
                channel,
                event,
                data: eventData
            });
        }
        catch (error) {
            console.error('Error triggering Pusher event:', {
                error,
                channel,
                event,
                data
            });
            if (error.status === 401) {
                console.error('Pusher authentication failed. Please check your credentials.');
            }
            throw error;
        }
    }
    async triggerBatch(events) {
        try {
            await this.pusher.triggerBatch(events.map(({ channel, event, data }) => ({
                channel,
                name: event,
                data,
            })));
        }
        catch (error) {
            console.error('Error triggering Pusher batch events:', error);
            throw error;
        }
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PusherService);
//# sourceMappingURL=pusher.service.js.map