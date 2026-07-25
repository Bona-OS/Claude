import Link from "next/link";
import CartBar from "@/components/CartBar";
import Marquee from "@/components/Marquee";
import MenuBrowser from "@/components/MenuBrowser";
import Reveal from "@/components/Reveal";
import { formatBRL } from "@/lib/format";
import { store, whatsappLink } from "@/lib/store";

const STEPS = [
  { n: "01", t: "Monte seu pedido", d: "Escolha os sabores, monte meio a meio e ajuste os tamanhos direto no cardápio." },
  { n: "02", t: "Pague por Pix", d: "Finalize em segundos com Pix ou deixe para pagar na entrega. Sem cadastro." },
  { n: "03", t: "Receba quentinha", d: `Sai do forno a lenha e chega em Jurerê em cerca de ${store.deliveryEtaMin} minutos.` },
];

const CRAFT = [
  { k: "48h", v: "de fermentação natural na massa" },
  { k: "400°C", v: "no forno a lenha, assada na hora" },
  { k: "Jurerê", v: "e região, com entrega própria" },
];

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">✺</span> {store.brand}
          </Link>
          <nav>
            <a href="#cardapio">Cardápio</a>
            <a href="#historia">A casa</a>
            <a className="nav-cta" href={whatsappLink("Olá! Gostaria de fazer um pedido.")} target="_blank" rel="noopener noreferrer">
              Pedir agora
            </a>
          </nav>
        </div>
      </header>

      {/* ---- HERO ---- */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap hero-inner">
          <p className="eyebrow">Forno a lenha · {store.neighborhood}, {store.city}</p>
          <h1 className="hero-title">
            A pizza <em>paulistana</em>
            <br />
            de verdade chegou
            <br />
            em <span className="ul">Jurerê</span>.
          </h1>
          <p className="lead">
            Massa de fermentação natural, molho de tomate italiano e o sabor de uma cantina de
            São Paulo — assada na lenha e entregue quentinha na sua porta.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href="#cardapio">
              Ver cardápio e pedir
            </a>
            <a className="btn btn-ghost btn-lg" href={whatsappLink("Olá! Gostaria de fazer um pedido.")} target="_blank" rel="noopener noreferrer">
              Pedir pelo WhatsApp
            </a>
          </div>

          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="seal-svg">
              <defs>
                <path id="sealpath" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
              </defs>
              <text className="seal-text">
                <textPath href="#sealpath" startOffset="0">
                  · FORNO A LENHA · MASSA NATURAL · PIZZA PAULISTANA
                </textPath>
              </text>
            </svg>
            <span className="seal-center">🍕</span>
          </div>
        </div>

        <a className="scroll-cue" href="#cardapio" aria-label="Rolar para o cardápio">
          <span>Role</span>
          <span className="scroll-line" />
        </a>
      </section>

      <Marquee
        items={[
          "Forno a lenha",
          "Fermentação natural 48h",
          "Meio a meio à vontade",
          "Entrega em Jurerê",
          "Pix na hora",
        ]}
      />

      {/* ---- MANIFESTO (dark) ---- */}
      <section className="manifesto" id="historia">
        <div className="wrap">
          <Reveal>
            <p className="section-index">A casa</p>
            <h2 className="manifesto-title">
              Feita com o tempo que boa pizza pede.
            </h2>
            <p className="manifesto-lead">
              Cada disco descansa por dois dias antes de encontrar a lenha. É essa paciência —
              e a borda leve, aerada, de cantina paulistana — que a gente empacota e leva até a
              praia.
            </p>
          </Reveal>
          <div className="craft">
            {CRAFT.map((c, i) => (
              <Reveal key={c.k} delay={i * 90} className="craft-item">
                <span className="craft-k">{c.k}</span>
                <span className="craft-v">{c.v}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- MENU ---- */}
      <main className="wrap" id="cardapio">
        <MenuBrowser />

        {/* ---- COMO FUNCIONA ---- */}
        <section className="steps">
          <Reveal>
            <p className="section-index">Como funciona</p>
            <h2 className="section-title">Do carrinho ao forno em três passos.</h2>
          </Reveal>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="step">
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- INFO ---- */}
        <section className="info">
          <Reveal className="info-card">
            <h3>Entrega</h3>
            <p>
              Atendemos {store.deliveryZones.join(", ")}. Taxa de {formatBRL(store.deliveryFeeCents)},
              pedido mínimo de {formatBRL(store.minOrderCents)}.
            </p>
          </Reveal>
          <Reveal className="info-card" delay={90}>
            <h3>Onde estamos</h3>
            <p>{store.address}</p>
            <p className="muted">{store.hours}</p>
          </Reveal>
          <Reveal className="info-card" delay={180}>
            <h3>Fale com a gente</h3>
            <p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp +{store.whatsapp}
              </a>
            </p>
            <p className="muted">Instagram {store.instagram}</p>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-word">{store.brand}</div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} · {store.neighborhood}, {store.city}</span>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      </footer>

      <CartBar />
    </>
  );
}
