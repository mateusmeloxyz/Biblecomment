import React, { createContext, useState } from "react";
import { Alert } from "@material-ui/lab";

import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";

export const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
	const [message, setMessage] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [severity, setSeverity] = useState("");

	function _closeFunction() {
		setIsOpen(false);
	}

	function handleNotification(newSeverity, newMessage) {
		setSeverity(newSeverity);
		setMessage(newMessage);
		setIsOpen(true);
	}

	return (
		<NotificationContext.Provider
			value={{
				handleNotification,
			}}
		>
			{children}
			<Snackbar open={isOpen} autoHideDuration={2000} onClose={_closeFunction}>
				<Alert onClose={_closeFunction} severity={severity}>
					{message}
				</Alert>
			</Snackbar>
		</NotificationContext.Provider>
	);
}

NotificationProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
