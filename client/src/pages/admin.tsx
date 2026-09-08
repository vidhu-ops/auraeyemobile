import { useEffect } from "react";
import AdminCrmApp from "./admin-crm/AdminCrmApp";

/** Full-screen admin shell — isolated from app zoom locks and mobile overlays. */
export default function AdminPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("admin-crm-active");
    body.classList.add("admin-crm-active");

    const viewport = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewport?.getAttribute("content") ?? "";
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, viewport-fit=cover"
      );
    }

    html.style.zoom = "";
    body.style.zoom = "";

    return () => {
      html.classList.remove("admin-crm-active");
      body.classList.remove("admin-crm-active");
      html.style.zoom = "";
      body.style.zoom = "";
      if (viewport && previousViewport) {
        viewport.setAttribute("content", previousViewport);
      }
    };
  }, []);

  return (
    <div className="admin-crm-shell fixed inset-0 z-[200] flex flex-col bg-slate-50 text-slate-900 overflow-hidden w-full max-w-[100vw]">
      <AdminCrmApp />
    </div>
  );
}
