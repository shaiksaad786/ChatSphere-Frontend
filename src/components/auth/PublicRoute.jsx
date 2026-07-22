import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/auth";

function PublicRoute({ children }) {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;