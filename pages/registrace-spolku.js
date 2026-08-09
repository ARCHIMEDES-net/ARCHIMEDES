export default function RetiredAssociationRegistrationPage() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/zadost?type=spolek",
      permanent: false,
    },
  };
}
