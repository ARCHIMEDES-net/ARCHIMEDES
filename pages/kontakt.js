import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/ceny.webp";

const team = [
  {
    name: "Antonín Koplík",
    role: "Autor projektu, jednatel společnosti",
    email: "antonin.koplik@eduvision.cz",
    phone: "",
    note: "Strategie projektu, partnerství, rozvoj",
  },
  {
    name: "Dominik Ševčík",
    role: "Ředitel realizací",
    email: "dominik.sevcik@eduvision.cz",
    phone: "+420 735 104 449",
    note: "Realizace učeben, technické řešení",
  },
  {
    name: "Martina Lačňáková",
    role: "Manažerka zakázek",
    email: "martina.lacnakova@eduvision.cz",
    phone: "+420 732 827 210",
    note: "Obchodní komunikace, poptávky, zakázky",
  },
  {
    name: "Natálie Lípová",
    role: "Manažerka programu a obsahu",
    email: "natalie.lipova@archimedeslive.com",
    phone: "+420 737 628 944",
    note: "Program, vysílání, obsah platformy",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
    note: "Komunita, spolupráce, partneři",
  },
  {
    name: "Roman Tuzar",
    role: "Ředitel pro strategická partnerství",
    email: "roman.tuzar@eduvision.cz",
    phone: "+420 736 457 835",
    note: "Spolupráce s institucemi, partnery a organizacemi",
  },
];

// zbytek souboru NECHÁVÁM beze změny
// (komponenty PrimaryButton, SecondaryButton, ContactCard, TeamCard, KontaktPage atd. zůstávají identické)
