export function getEffectiveUserId(authCurrentUserUid: string | undefined): string | null {
  if (typeof window !== "undefined") {
    const impersonated = localStorage.getItem("admin_impersonating_shop");
    if (impersonated) return impersonated;
    
    const bossUid = localStorage.getItem("sd_boss_uid");
    if (bossUid) return bossUid;
  }
  return authCurrentUserUid || null;
}