import { Providers } from "@/components/Providers";

export const dynamic = "force-dynamic";

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Providers>{children}</Providers>;
}
