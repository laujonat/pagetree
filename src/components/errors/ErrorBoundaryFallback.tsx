import { ErrorBoundaryFallbackProps } from "./ErrorBoundary";

export const ErrorBoundaryFallback = (props: ErrorBoundaryFallbackProps) => {
  return (
    <>
      <div>
        <button onClick={props.clearError}>Try again</button>
      </div>
      <pre>{props.error.toString()}</pre>
    </>
  );
};
