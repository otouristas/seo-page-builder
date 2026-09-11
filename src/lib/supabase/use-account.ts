"use client";
import { useEffect, useState } from "react";
import { createClient } from "./client";
/**
 * The signed-in email for display only, read in the browser so public pages
 * stay static. Access itself is always decided again on the server.
 */
export function useAccount() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    let live = true;
    let stop = () => {};
    try {
      const db = createClient();
      db.auth
        .getSession()
        .then(({ data }) => {
          if (live) setEmail(data.session?.user?.email || "");
        })
        .catch(() => {});
      const listener = db.auth.onAuthStateChange((_event, session) => {
        if (live) setEmail(session?.user?.email || "");
      });
      stop = () => listener.data.subscription.unsubscribe();
    } catch {
      /* Sign-in is unavailable until Supabase is configured. */
    }
    return () => {
      live = false;
      stop();
    };
  }, []);
  return email;
}
