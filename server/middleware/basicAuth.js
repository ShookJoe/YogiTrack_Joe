import crypto from "crypto";

function safeEqual(a, b) {
  const bufA = Buffer.from(a || "", "utf8");
  const bufB = Buffer.from(b || "", "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Gates every request behind Basic Auth, but only if APP_USERNAME and  APP_PASSWORD are actually set
export function basicAuth(req, res, next) {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  if (!username || !password) return next();

  const [scheme, encoded] = (req.headers.authorization || "").split(" ");
  if (scheme === "Basic" && encoded) {
    const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
    if (safeEqual(user, username) && safeEqual(pass, password)) {
      return next();
    }
  }

  res.set("WWW-Authenticate", 'Basic realm="YogiTrack"');
  res.status(401).send("Authentication required");
}
