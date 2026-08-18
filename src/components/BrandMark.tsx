/** SparkBill mark — a spark inside a receipt. Takes its colour from the container. */
export const BrandMark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M7.4 3.6h9.2a1 1 0 0 1 1 1v14.1a.55.55 0 0 1-.83.48l-1.54-.9-1.54.9-1.54-.9-1.54.9-1.54-.9-1.54.9a.55.55 0 0 1-.83-.48V4.6a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M12 7.1l1.03 2.62 2.62 1.03-2.62 1.03L12 14.4l-1.03-2.62-2.62-1.03 2.62-1.03L12 7.1Z"
      fill="currentColor"
    />
  </svg>
)
