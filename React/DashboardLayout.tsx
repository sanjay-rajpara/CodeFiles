import React, { ReactNode } from 'react';
import { Navigation } from '../components/navigations/Navigation';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
	children?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	return (
		<main className="p-1 p-xl-6 p-4xl-8 d-flex">
			<Navigation />
			<Outlet />
		</main>
	)
}
