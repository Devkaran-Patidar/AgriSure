import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../lib/routeSecurity";

export default function ProtectedRoute({ roles }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="grid min-h-screen place-items-center text-sm font-semibold text-slate-600">
				Loading secure area...
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
				state={{ from: location.pathname }}
			/>
		);
	}

	if (roles && !roles.includes(user.role)) {
		return (
			<Navigate
				to={getDashboardPathByRole(user.role)}
				replace
			/>
		);
	}

	return <Outlet />;
}
