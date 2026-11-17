import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/AdminToast";

/* Root of the /admin area. It sits outside MainLayout, so none of the public-site
   effects (preloader, custom cursor, smooth scroll, page transitions) run here. */
export default function AdminLayout() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("is-loading");
    html.classList.add("is-loaded", "admin-mode");
    return () => html.classList.remove("admin-mode");
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Helmet>
          <title>Admin | Property Search Capital</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  );
}
