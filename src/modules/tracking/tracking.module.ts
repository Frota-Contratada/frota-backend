import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { TrackingController } from './controllers/tracking.controller';
import { TrackingGateway } from './gateways/tracking.gateway';
import { TomTomRouteService } from './services/tomtom-route.service';
import { TrackingEventsService } from './services/tracking-events.service';
import { TrackingService } from './services/tracking.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TrackingController],
  providers: [
    TomTomRouteService,
    TrackingEventsService,
    TrackingService,
    TrackingGateway,
  ],
  exports: [TrackingService],
})
export class TrackingModule {}
