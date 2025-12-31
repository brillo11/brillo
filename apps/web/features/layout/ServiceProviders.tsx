import { ServiceClientProviders } from "@/features/layout/ServiceClientProviders";

export async function ServiceProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceClientProviders>
      <div className="flex flex-col flex-1 w-full min-h-screen">
        <div className="flex-1 bg-vzx-bg/80">{children}</div>
      </div>
    </ServiceClientProviders>
  );
}
