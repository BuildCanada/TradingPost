export interface LumaEventHost {
  name: string | null;
  avatarUrl: string;
}

export interface LumaEventAddress {
  city: string | null;
  region: string | null;
  country: string | null;
  fullAddress: string | null;
  description: string | null;
}

export interface LumaEvent {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  timezone: string;
  coverUrl: string;
  url: string;
  address: LumaEventAddress | null;
  hosts: LumaEventHost[];
}
