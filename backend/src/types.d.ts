declare namespace Express {
  export interface Request {
    authUserId?: string;
    /** The Supabase Auth user id (auth.users.id) when the request carried a Supabase token. */
    supabaseUserId?: string;
  }
}
