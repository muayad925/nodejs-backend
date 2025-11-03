import { createRemoteJWKSet, jwtVerify } from "jose";
import { supabase } from "../config/supabase.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).send("Missing Authorization header");
    }

    const token = header.split(" ")[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).send("Invalid or expired token");
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).send("Invalid or expired token");
  }
};
