import { Navigate } from "react-router-dom";
const Protected = ({ component: Component, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  if (!token || userRole !== role) {
    return <Navigate to="/" />;
  }
  return <Component />;
};
export default Protected;
