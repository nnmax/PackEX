import { ReactComponent as FooterBgR } from '@/assets/images/footer.svg'

export default function Footer() {
  return (
    <footer className="flex items-center pt-20 bg-[--body-bg] justify-center fixed w-full bottom-0">
      <div className="h-20 bg-[#030303] max-w-[calc(var(--main-max-width)+var(--main-x-padding)*2)] relative">
        <FooterBgR className="h-full w-full" />
      </div>
    </footer>
  )
}
