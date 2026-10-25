import { Navigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function AuthGuard({ children, role }) {
  const [cookies] = useCookies(["accessToken", "userData"]);
  const location = useLocation();

  if (!cookies.accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role) {
    const roles = Array.isArray(cookies.userData?.roles)
      ? cookies.userData.roles
      : [];
    if (!roles.map((r) => String(r).toLowerCase()).includes(role.toLowerCase())) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
