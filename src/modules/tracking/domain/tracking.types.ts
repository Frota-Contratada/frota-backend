export type TrackingPosition = {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number;
  heading: number;
  timestamp: string;
};

export const TRACKING_MAX_FUTURE_SKEW_MS = 5 * 60 * 1_000;

export type RouteWaypoint = {
  id: string;
  sequence: number;
  kind: 'origin' | 'stop' | 'destination';
  label: string;
  lat: number;
  lng: number;
};

export type CanonicalRoute = {
  routeId: string;
  version: number;
  calculatedAt: string;
  origin: RouteWaypoint;
  stops: RouteWaypoint[];
  destination: RouteWaypoint;
  coordinates: Array<{ lat: number; lng: number }>;
  distanceMeters: number;
  durationSeconds: number;
  trafficDelaySeconds: number;
  trafficSections: Array<{
    startIndex: number;
    endIndex: number;
    delaySeconds: number;
    category: string;
  }>;
  instructions: Array<{
    id: string;
    instruction: string;
    streetName: string;
    distanceMeters: number;
    durationSeconds: number;
    type: string;
    modifier: string | null;
    icon: string | null;
    location: { lat: number; lng: number };
    coordinateIndex: number;
  }>;
};

export type TrackingSnapshot = {
  tripStatus: 'scheduled' | 'in_progress' | 'finished' | 'canceled';
  waiting: { active: boolean; startedAt: string | null };
  route: CanonicalRoute;
  vehiclePosition: TrackingPosition | null;
  passengerPosition: TrackingPosition | null;
  driver: { id: string; displayName: string };
  vehicle: { id: string; plate: string; description?: string };
  startedAt: string;
  updatedAt: string;
};

export type TrackingEventType =
  | 'vehicle.location'
  | 'passenger.location'
  | 'route.replaced'
  | 'waiting.changed'
  | 'trip.statusChanged';
