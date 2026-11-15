export const queryKeys = {
  auth: {
    user: () => ["auth", "user"] as const,
    session: () => ["auth", "session"] as const,
    profile: () => ["auth", "profile"] as const
  },
  groups: {
    all: () => ["groups"] as const,
    list: () => [...queryKeys.groups.all(), "list"] as const,
    detail: (id: string) => [...queryKeys.groups.all(), "detail", id] as const,
    members: (id: string) => [...queryKeys.groups.detail(id), "members"] as const,
    invite: (id: string) => [...queryKeys.groups.detail(id), "invite"] as const
  },
  churches: {
    all: () => ["churches"] as const,
    list: (params?: ChurchListParams) => [...queryKeys.churches.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.churches.all(), "detail", id] as const,
    aggregates: (id: string) => [...queryKeys.churches.detail(id), "aggregates"] as const,
    ratings: (id: string) => [...queryKeys.churches.detail(id), "ratings"] as const,
    media: (id: string) => [...queryKeys.churches.detail(id), "media"] as const,
    search: (query: string) => [...queryKeys.churches.all(), "search", query] as const,
    inBounds: (bounds: MapBounds) => [...queryKeys.churches.all(), "bounds", bounds] as const
  },
  ratings: {
    mine: (churchId: string) => ["ratings", "mine", churchId] as const
  },
  media: {
    uploadUrl: (churchId: string) => ["media", "uploadUrl", churchId] as const
  }
} as const;

export interface ChurchListParams {
  groupId?: string | null;
  denomination?: string;
  minRating?: number;
  hasOrgan?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}