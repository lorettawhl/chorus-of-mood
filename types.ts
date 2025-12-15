export enum ArousalLevel {
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH'
}

export interface SensorState {
  id: string;
  level: ArousalLevel;
  isActive: boolean;
  color: string;
  label: string;
  soundDescription: string;
}

export interface TeamMember {
  name: string;
  role: string;
}
