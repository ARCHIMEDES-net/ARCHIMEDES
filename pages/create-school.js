export default function RetiredCreateSchoolPage() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/registrace-skoly",
      permanent: false,
    },
  };
}
