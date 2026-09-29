import React from "react";
import type { PropsWithChildren,  ReactElement, ReactNode } from "react";

interface WhenProps {
	condition: boolean;
	children: ReactNode;
}

const Match = ({ children }: PropsWithChildren): ReactNode => {
	const childrenArray = React.Children.toArray(children);

	for (const child of childrenArray) {
		if (!React.isValidElement<PropsWithChildren>(child)) continue;

		if (child.type === Default) return child.props.children;

		if (child.type === When && "condition" in child.props) {
			if (child.props.condition) {
				return child.props.children;
			}
		}
	}

	return null;
};

const When = ({ children }: PropsWithChildren<WhenProps>): ReactElement => {
	return <>{children}</>;
};

const Default = ({ children }: PropsWithChildren): ReactElement => {
	return <>{children}</>;
};

// Add display names for better debugging
Match.displayName = "Match";
When.displayName = "Match.When";
Default.displayName = "Match.Default";

// Create compound component
const MatchWithHelpers = Match as typeof Match & {
	When: typeof When;
	Default: typeof Default;
};

MatchWithHelpers.When = When;
MatchWithHelpers.Default = Default;

export default MatchWithHelpers;
