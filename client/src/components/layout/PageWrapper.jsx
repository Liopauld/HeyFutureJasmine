export default function PageWrapper({ children }) {
  return <main className="mx-auto w-full max-w-6xl px-6 py-12 relative z-10">{children}</main>;
}
