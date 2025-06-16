
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to diagnostic page first to test basic functionality
  return <Navigate to="/diagnostic" replace />;
};

export default Index;
