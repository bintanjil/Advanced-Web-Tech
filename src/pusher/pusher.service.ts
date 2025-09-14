import { Injectable } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '2050466',
      key: process.env.PUSHER_KEY || 'cdfc8abb8d9230af175c',
      secret: process.env.PUSHER_SECRET || '8174bc301577c834f223',  // Updated secret
      cluster: process.env.PUSHER_CLUSTER || 'ap1',
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any) {
    try {
      // Add timestamp to data for debugging
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
    } catch (error) {
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

  async triggerBatch(events: { channel: string; event: string; data: any }[]) {
    try {
      await this.pusher.triggerBatch(
        events.map(({ channel, event, data }) => ({
          channel,
          name: event,
          data,
        })),
      );
    } catch (error) {
      console.error('Error triggering Pusher batch events:', error);
      throw error;
    }
  }
}
