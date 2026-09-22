import logoMark from '../assets/logo.svg'

export const BrandMark = ({ className }: { className?: string }) => (
  <img src={logoMark} alt="" className={className} />
)
