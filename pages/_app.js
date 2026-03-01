import { useRouter } from "next/router";
import RequireAuth from "../components/RequireAuth";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // pokud URL začíná /portal → chránit
  if (router.pathname.startsWith("/portal")) {
    return (
      <RequireAuth>
        <Component {...pageProps} />
      </RequireAuth>
    );
  }

  return <Component {...pageProps} />;
}
