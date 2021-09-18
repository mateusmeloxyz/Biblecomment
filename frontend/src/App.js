import "./App.css";
import "./Responsive.css";

import { NotificationProvider } from "./contexts/NotificationContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { useEffect } from "react";

import React from "react";
import Routes from "./routes";

export default function App() {
	useEffect(() => {
		const usesDarkMode =
			window.matchMedia("(prefers-color-scheme: dark)").matches || false;
		const lightSchemeIcon = document.querySelector("link#light-icon");
		const darkSchemeIcon = document.querySelector("link#dark-icon");

		if (usesDarkMode) {
			lightSchemeIcon.remove();
			document.head.append(darkSchemeIcon);
		} else {
			document.head.append(lightSchemeIcon);
			darkSchemeIcon.remove();
		}
	}, []);

	return (
		<div className="container">
			<h1> Bible Comment </h1>
			<sub> A Program for His Glory </sub>

			<div className="content">
				<NotificationProvider>
					<ProfileProvider>
						<Routes />
					</ProfileProvider>
				</NotificationProvider>
			</div>

			<footer> Inspired by God, written by JDaniloC </footer>
		</div>
	);
}
