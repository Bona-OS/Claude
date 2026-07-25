import Link from "next/link";
import CartBar from "@/components/CartBar";
import MenuBrowser from "@/components/MenuBrowser";
import { formatBRL } from "@/lib/format";
import { store, whatsappLink } from "@/lib/store";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link href="/" className="logo">
            🍕 {store.brand}
          </Link>
          <nav>
            <a href="#pizzas-salgadas">Cardápio</a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Forno a lenha · {store.neighborhood}, {store.city}</p>
          <h1>
            A verdadeira <span className="grad">pizza paulistana</span>
            <br />
            chegou em Jurerê.
          </h1>
          <p className="lead">
            Massa de fermentação natural, ingredientes selecionados e aquele sabor de São Paulo,
            assada na hora. Peça on-line, monte meio a meio e pague por Pix.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href="#pizzas-salgadas">
              Ver cardápio e pedir
            </a>
            <a className="btn btn-ghost btn-lg" href={whatsappLink("Olá! Gostaria de fazer um pedido.")} target="_blank" rel="noopener noreferrer">
              Pedir pelo WhatsApp
            </a>
          </div>
          <ul className="hero-badges">
            <li>🛵 Entrega em {store.deliveryEtaMin} min</li>
            <li>💠 Pix ou na entrega</li>
            <li>🕒 {store.hours}</li>
          </ul>
        </div>
      </section>

      <main className="wrap">
        <MenuBrowser />

        <section className="info">
          <div className="info-card">
            <h3>Entrega</h3>
            <p>
              Atendemos {store.deliveryZones.join(", ")}. Taxa de {formatBRL(store.deliveryFeeCents)} e
              pedido mínimo de {formatBRL(store.minOrderCents)}.
            </p>
          </div>
          <div className="info-card">
            <h3>Onde estamos</h3>
            <p>{store.address}</p>
            <p className="muted">{store.hours}</p>
          </div>
          <div className="info-card">
            <h3>Fale com a gente</h3>
            <p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp: +{store.whatsapp}
              </a>
            </p>
            <p className="muted">Instagram {store.instagram}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          © {new Date().getFullYear()} {store.brand} · {store.neighborhood}, {store.city}
        </div>
      </footer>

      <CartBar />
    </>
  );
}
