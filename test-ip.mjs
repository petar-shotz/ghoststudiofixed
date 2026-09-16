import crypto from 'crypto';

// The logic from lib/auth.ts
function getIp(forwarded, fastlyIp, realIp) {
  const forwardedIps = forwarded.split(",").map(ip => ip.trim()).filter(Boolean);
  const trustedForwardedIp = forwardedIps.length > 0 ? forwardedIps[forwardedIps.length - 1] : "";
  return fastlyIp || realIp || trustedForwardedIp || "127.0.0.1";
}

function hashIp(ip) {
  const salt = "test-salt";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 40);
}

const req1 = { forwarded: "2.2.2.2", fastlyIp: "", realIp: "" };
const req2 = { forwarded: "3.3.3.3", fastlyIp: "", realIp: "" };
// Attacker tries to spoof 2.2.2.2 by sending X-Forwarded-For: 2.2.2.2
// The GFE appends the attacker's real IP (e.g. 9.9.9.9)
const attackerReq = { forwarded: "2.2.2.2, 9.9.9.9", fastlyIp: "", realIp: "" };

const ip1 = getIp(req1.forwarded, req1.fastlyIp, req1.realIp);
const ip2 = getIp(req2.forwarded, req2.fastlyIp, req2.realIp);
const ipAttacker = getIp(attackerReq.forwarded, attackerReq.fastlyIp, attackerReq.realIp);

console.log(`Visitor 1 Real IP: ${ip1} (Hash: ${hashIp(ip1)})`);
console.log(`Visitor 2 Real IP: ${ip2} (Hash: ${hashIp(ip2)})`);
console.log(`Attacker Real IP: ${ipAttacker} (Hash: ${hashIp(ipAttacker)})`);
console.log(`Attacker matches Visitor 1? ${hashIp(ipAttacker) === hashIp(ip1)}`);
console.log(`Visitor 1 and 2 share rate limit? ${hashIp(ip1) === hashIp(ip2)}`);

