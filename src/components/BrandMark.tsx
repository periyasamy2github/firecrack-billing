import logoMark from '../assets/logo-1.png'

// The shop's logo mark — used wherever the app brand appears (sidebar, sign-in).
export const BrandMark = ({ className }: { className?: string }) => (
  <img src={logoMark} alt="" className={className} />
)
