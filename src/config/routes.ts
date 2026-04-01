export const SITE_ROUTES = {
  marketingHome: "/",
  login: "/login",
  checkEmail: "/check-email",
  hostHome: "/host",
  playerHome: "/player",
  gameHost: (gameId: string) => `/g/${gameId}/host`,
  gamePlayer: (gameId: string) => `/g/${gameId}/player`,
  gameRoom: (gameId: string, roomCode: string) => `/g/${gameId}/room/${roomCode}`,
  join: (code: string) => `/join/${code}`,
  room: (code: string) => `/room/${code}`,
} as const;
