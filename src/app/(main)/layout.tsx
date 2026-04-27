import { AppChrome } from "@/components/AppChrome";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return <AppChrome>{children}</AppChrome>;
}
