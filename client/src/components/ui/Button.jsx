export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full px-5 py-3 font-ui transition-shadow ${className}`}
    >
      {children}
    </button>
  );
}
