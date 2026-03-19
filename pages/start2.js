import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";

const initialForm = {
  schoolName: "",
  ico: "",
  street: "",
  city: "",
  zip: "",
  contactName: "",
  role: "",
  email: "",
  phone: "",
  note: "",
  agree: false,
};

export default function StartPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    setSuccess(true);
    setForm(initialForm);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="page">
        <div className="container">
          <h1>Objednávka přijata</h1>
          <p>
            Děkujeme. Na e-mail vám zašleme potvrzení, fakturu a přístup do
            programu.
          </p>

          <Link href="/" className="btn">
            Zpět na web
          </Link>
        </div>

        <style jsx>{`
          .page {
            padding: 80px 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
          }
          h1 {
            font-size: 36px;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 18px;
            background: black;
            color: white;
            border-radius: 8px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>START | ARCHIMEDES Live</title>
      </Head>

      <main className="page">
        <div className="container">
          <h1>Objednávka balíčku START</h1>

          <p className="lead">
            Získejte přístup k programu ARCHIMEDES Live na období duben–červen
            2026.
          </p>

          <div className="box">
            <strong>Balíček START</strong>
            <br />
            období: duben–červen 2026
            <br />
            cena: 4 990 Kč bez DPH
          </div>

          <div className="steps">
            <h3>Jak to probíhá:</h3>
            <ul>
              <li>Odesláním objednávky rezervujete místo</li>
              <li>Zašleme vám fakturu</li>
              <li>Získáte přístup do programu</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              name="schoolName"
              placeholder="Název školy"
              value={form.schoolName}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label className="check">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                required
              />
              Souhlasím s podmínkami
            </label>

            <button disabled={loading}>
              {loading ? "Odesílám..." : "Objednat balíček START"}
            </button>
          </form>
        </div>

        <Footer />

        <style jsx>{`
          .page {
            padding: 60px 20px;
            background: #f7f7f7;
          }

          .container {
            max-width: 700px;
            margin: auto;
          }

          h1 {
            font-size: 42px;
            margin-bottom: 10px;
          }

          .lead {
            margin-bottom: 20px;
          }

          .box {
            background: white;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 20px;
          }

          .steps {
            margin-bottom: 20px;
          }

          input {
            display: block;
            width: 100%;
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            border: 1px solid #ccc;
          }

          button {
            padding: 14px;
            width: 100%;
            background: black;
            color: white;
            border-radius: 10px;
            font-weight: bold;
          }

          .check {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
          }
        `}</style>
      </main>
    </>
  );
}
