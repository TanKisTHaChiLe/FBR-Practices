export interface Note {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkStatus {
  isOnline: boolean;
}