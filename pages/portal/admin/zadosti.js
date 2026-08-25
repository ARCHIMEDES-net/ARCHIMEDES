export function getServerSideProps() {
  return {
    redirect: {
      destination: "/portal/admin/obce",
      permanent: false,
    },
  };
}

export default function AdminZadostiRedirect() {
  return null;
}
