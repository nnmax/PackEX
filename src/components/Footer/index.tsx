import { ReactComponent as FooterBgR } from '@/assets/images/footer.svg'

export default function Footer() {
  return (
    <footer className="h-20 bg-[#030303] flex items-center justify-center">
      <div className="max-w-[calc(var(--main-max-width)+var(--main-x-padding)*2)] relative">
        <FooterBgR className="h-full w-full" />
      </div>
    </footer>
  )
}