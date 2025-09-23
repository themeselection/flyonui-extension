import { cn } from '@/utils';

interface FlyonUILogoProps {
  className?: string;
}

export function FlyonUILogo({ className }: FlyonUILogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
    >
      {/* SVGL Logo */}
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="19.5"
        fill="url(#paint0_linear_15373_2835)"
      />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="19.5"
        stroke="url(#paint1_linear_15373_2835)"
      />
      <path
        d="M18.8222 23.4734C19.0679 23.1621 19.5363 23.1499 19.7978 23.448L23.7441 27.947C24.1036 28.3571 23.8128 28.9995 23.2675 28.9998H15.7685C15.2388 28.9994 14.9426 28.3884 15.2704 27.9724L18.8222 23.4734ZM18.8437 11.2381C19.0963 10.9228 19.5756 10.9202 19.831 11.2332L30.9706 24.9021C31.3082 25.3167 31.0131 25.9373 30.4785 25.9373H27.0175C26.8265 25.9372 26.6458 25.8511 26.5253 25.7029L19.8408 17.4636C19.5827 17.1458 19.0957 17.1522 18.8456 17.4763L12.7568 25.3806C12.6367 25.5365 12.4507 25.6277 12.2538 25.6277H8.63568C8.10337 25.6277 7.80772 25.0119 8.14056 24.5964L18.8437 11.2381Z"
        fill="url(#paint2_linear_15373_2835)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_15373_2835"
          x1="35.625"
          y1="3.125"
          x2="5"
          y2="38.125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#794DFF" />
          <stop offset="1" stop-color="#5A16EB" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_15373_2835"
          x1="18.6478"
          y1="40"
          x2="21.3522"
          y2="2.96227e-07"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#E4E9EC" />
          <stop offset="1" stop-color="white" stop-opacity="0.6" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_15373_2835"
          x1="19.5572"
          y1="11"
          x2="19.5572"
          y2="28.9998"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="white" stop-opacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
