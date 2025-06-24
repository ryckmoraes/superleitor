
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to loading screen to run diagnostics
  return <Navigate to="/loading" replace />;
};

export default Index;
