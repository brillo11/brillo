import NavigationBar from "./components/navigation-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavigationBar />
      {children}
    </div>
  );
}
