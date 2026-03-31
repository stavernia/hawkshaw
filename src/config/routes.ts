export const SITE_ROUTES = {
  marketingHome: "/",
  login: "/login",
  checkEmail: "/check-email",
  hostHome: "/host",
  playerHome: "/player",
  join: (code: string) => `/join/${code}`,
  room: (code: string) => `/room/${code}`,
} as const;

