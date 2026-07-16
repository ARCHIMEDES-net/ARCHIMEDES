export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/nastaveni-pristupu",
      permanent: false,
    },
  };
}

export default function LegacyWelcomeRedirect() {
  return null;
}
