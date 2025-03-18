
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to welcome screen
  return <Navigate to="/welcome" replace />;
};

export default Index;
