// Gates admin self-signup behind a shared secret so the endpoint can stay
// reachable (useful for onboarding a new admin without a deploy) without
// being publicly open. Set ADMIN_INVITE_TOKEN in the environment and share
// it out-of-band with the person you're inviting; rotate it after use.
export const requireInviteToken = (req, res, next) => {
  const configured = process.env.ADMIN_INVITE_TOKEN;

  if (!configured) {
    return res.status(403).json({
      message: "Admin signup is disabled. Use the seed script instead.",
    });
  }

  const provided = req.headers["x-admin-invite-token"];
  if (provided !== configured) {
    return res.status(403).json({ message: "Invalid or missing invite token." });
  }

  next();
};
