// Re-export from applications feature (canonical source)

export type { ApplicationStatusConfig } from "../../applications/utils/application-status";
export {
	getApplicationStatusConfig,
	isActiveStatus,
	isTerminalStatus,
} from "../../applications/utils/application-status";
