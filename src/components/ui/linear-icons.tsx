import type { SVGProps } from "react";

type LinearIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function BaseIcon({ title, children, ...props }: LinearIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function InfoIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.5v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" />
    </BaseIcon>
  );
}

export function WarningIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M10.7 4.6 3.3 17.4A1.7 1.7 0 0 0 4.8 20h14.4a1.7 1.7 0 0 0 1.5-2.6L13.3 4.6a1.5 1.5 0 0 0-2.6 0Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M12 9v4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </BaseIcon>
  );
}

export function CheckCircleIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.4 12.2 2.3 2.3 4.9-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </BaseIcon>
  );
}

export function XCircleIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </BaseIcon>
  );
}

export function TrendUpIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 16.5 9.5 11l3.5 3.5 6.5-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15.5 7.5h4v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </BaseIcon>
  );
}

export function TrendDownIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7.5 9.5 13l3.5-3.5 6.5 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15.5 16.5h4v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </BaseIcon>
  );
}

export function TrendNeutralIcon(props: LinearIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m15.5 8.5 3.5 3.5-3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </BaseIcon>
  );
}
