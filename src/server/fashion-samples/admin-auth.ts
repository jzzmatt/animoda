export type AdminAuthorization = "unavailable";

/**
 * Browser administration is closed. There is no account or role system yet, and the OpenAI key
 * must not be used as a client credential. Catalogue reports and batches run in the server process,
 * which already holds the Supabase service credential.
 */
export function authorizeFashionSampleAdmin(authorizationHeader: string | null = null): AdminAuthorization {
  void authorizationHeader;
  return "unavailable";
}
