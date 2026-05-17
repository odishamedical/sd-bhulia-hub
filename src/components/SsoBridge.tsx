"use client";

import { useEffect } from "react";

export default function SsoBridge() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const ssoEmail = urlParams.get("sso_email");
      const ssoName = urlParams.get("sso_name");
      const ssoAvatar = urlParams.get("sso_avatar");
      const ssoRole = urlParams.get("sso_role");

      if (token === "sd_super_admin_secret_token" || ssoRole === "super_admin" || ssoEmail === "odishamedical@gmail.com" || ssoEmail === "shyamdash@gmail.com") {
        const email = ssoEmail || "odishamedical@gmail.com";
        const name = ssoName || (email === "odishamedical@gmail.com" ? "Odisha Medical (Super Admin)" : "Shyam Dash");
        const avatar = ssoAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
        const role = "super_admin";

        localStorage.setItem("sd_current_user_email", email);
        localStorage.setItem("sd_current_user_name", name);
        localStorage.setItem("sd_current_user_avatar", avatar);
        localStorage.setItem("sd_current_user_role", role);
        localStorage.setItem("sd_current_user_uid", "sd_super_admin_custom_uid");

        window.dispatchEvent(new Event("sd_auth_change"));
      } else if (ssoEmail) {
        const email = ssoEmail;
        const name = ssoName || ssoEmail.split("@")[0];
        const avatar = ssoAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
        const role = ssoRole || "user";

        localStorage.setItem("sd_current_user_email", email);
        localStorage.setItem("sd_current_user_name", name);
        localStorage.setItem("sd_current_user_avatar", avatar);
        localStorage.setItem("sd_current_user_role", role);
        localStorage.setItem("sd_current_user_uid", "sd_sso_custom_uid");

        window.dispatchEvent(new Event("sd_auth_change"));
      }
    }
  }, []);

  return null;
}
