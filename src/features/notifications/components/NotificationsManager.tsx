import { useState } from "react";
import { NotificationBell } from "./NotificationBell";
import { NotificationDrawer } from "./NotificationDrawer";

export function NotificationsManager() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<NotificationBell onClick={() => setIsOpen(true)} />
			<NotificationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
