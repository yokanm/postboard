import { useCallback, useState } from "react";

interface CursorPaginationState {
	cursor: string | undefined;
	cursorStack: string[];
	currentPage: number;
}

interface CursorPaginationResult {
	cursor: string | undefined;
	cursorStack: string[];
	currentPage: number;
	hasPrevPage: boolean;
	goNext: (nextCursor: string | null | undefined) => void;
	goPrev: () => void;
	reset: () => void;
}

export function useCursorPagination(): CursorPaginationResult {
	const [state, setState] = useState<CursorPaginationState>({
		cursor: undefined,
		cursorStack: [],
		currentPage: 0,
	});

	const hasPrevPage = state.cursorStack.length > 0;

	const goNext = useCallback((nextCursor: string | null | undefined) => {
		if (!nextCursor) return;
		setState((prev) => ({
			cursor: nextCursor,
			cursorStack: [...prev.cursorStack, prev.cursor ?? ""],
			currentPage: prev.currentPage + 1,
		}));
	}, []);

	const goPrev = useCallback(() => {
		setState((prev) => {
			const stack = [...prev.cursorStack];
			const prevCursor = stack.pop();
			return {
				cursor: prevCursor || undefined,
				cursorStack: stack,
				currentPage: Math.max(0, prev.currentPage - 1),
			};
		});
	}, []);

	const reset = useCallback(() => {
		setState({ cursor: undefined, cursorStack: [], currentPage: 0 });
	}, []);

	return {
		cursor: state.cursor,
		cursorStack: state.cursorStack,
		currentPage: state.currentPage,
		hasPrevPage,
		goNext,
		goPrev,
		reset,
	};
}
