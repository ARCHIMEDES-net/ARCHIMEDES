export default function RetiredCreateSchoolPage() {
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
