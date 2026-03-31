const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM!;

export const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!;
export const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET!;

export const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
export const LOGOUT_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;
