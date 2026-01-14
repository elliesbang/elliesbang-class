export type AuthModalDetail = {
  mode: "login" | "signup";
  role?: "student" | "admin" | null;
  message?: string;
};

export const openAuthModal = (detail: AuthModalDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthModalDetail>("auth-modal", { detail }));
};

export const openLoginModal = (
  role?: "student" | "admin" | null,
  message?: string
) => {
  openAuthModal({ mode: "login", role, message });
};

export const openSignupModal = (
  role?: "student" | "admin" | null,
  message?: string
) => {
  openAuthModal({ mode: "signup", role, message });
};
