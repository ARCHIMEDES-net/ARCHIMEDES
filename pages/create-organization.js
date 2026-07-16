export default function RetiredCreateOrganizationPage() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/zadost",
      permanent: false,
    },
  };
}
