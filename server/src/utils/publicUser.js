/** Profile returned to browsers; excludes authentication secrets. */
export function publicUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    username: user.username,
    displayName: user.displayName || user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    pirateTitle: user.pirateTitle,
    bounty: user.bounty,
    avatar: user.avatar || null,
    anniversary: user.anniversary || null
  };
}
