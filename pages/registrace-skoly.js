export default function RetiredSchoolRegistrationPage() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/zadost?type=skola",
      permanent: false,
    },
  };
}
