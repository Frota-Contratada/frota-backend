import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';
import { TrackingEventType } from '../domain/tracking.types';

@Injectable()
export class TrackingEventsService {
  private server?: Server;

  attach(server: Server): void {
    this.server = server;
  }

  publish(tripId: number, type: TrackingEventType, payload: unknown): void {
    this.server?.to(`trip:${tripId}`).emit('trip.event', {
      schemaVersion: 1,
      type,
      eventId: randomUUID(),
      tripId: String(tripId),
      sentAt: new Date().toISOString(),
      payload,
    });
  }
}
