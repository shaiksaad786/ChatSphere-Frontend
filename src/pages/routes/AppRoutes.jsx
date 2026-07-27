import {Routes, Route, Navigate} from "react-router-dom";
import Login from "../Login";
import Register from "../Register";
import Dashboard from "../Dashboard";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import PublicRoute from "../../components/auth/PublicRoute";
import Profile from "../Profile";
import Settings from "../Settings";
function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" 
                element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
                } >
            <Route index element={<Profile />} />

            <Route path="profile" element={<Profile />} />

            <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}
export default AppRoutes;