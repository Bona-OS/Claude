const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/0000000000";
const BRAND = process.env.NEXT_PUBLIC_BRAND || "FotoRestaura";
const PRICE = process.env.PRICE_BRL || "29";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <h1>
            Suas fotos antigas <span className="grad">como novas</span>,<br />
            direto no WhatsApp.
          </h1>
          <p>
            Rasgada, desbotada, manchada ou só apagada pelo tempo? Mande pelo WhatsApp e receba ela
            restaurada por IA em minutos. Sem app, sem cadastro — e você só paga se gostar.
          </p>
          <a className="cta" href={WHATSAPP_LINK}>
            📲 Restaurar minha foto agora
          </a>
        </div>
      </section>

      <div className="wrap">
        <section className="steps">
          <div className="step">
            <div className="num">PASSO 1</div>
            <h3>Mande a foto</h3>
            <p>Tire um print ou foto da imagem antiga e envie no nosso WhatsApp.</p>
          </div>
          <div className="step">
            <div className="num">PASSO 2</div>
            <h3>A IA restaura</h3>
            <p>Removemos riscos e manchas, recuperamos rostos e cores em menos de 1 minuto.</p>
          </div>
          <div className="step">
            <div className="num">PASSO 3</div>
            <h3>Veja o antes/depois</h3>
            <p>Você recebe o resultado na hora e finaliza por Pix só se amar.</p>
          </div>
        </section>

        <section className="pricing">
          <div className="num" style={{ color: "var(--accent-2)" }}>PREÇO SIMPLES</div>
          <div className="price">
            R$ {PRICE}
            <small> / foto</small>
          </div>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Pague por Pix, só depois de ver o resultado. Pacotes para a família inteira sob consulta.
          </p>
          <a className="cta" href={WHATSAPP_LINK} style={{ marginTop: 24 }}>
            Começar pelo WhatsApp
          </a>
        </section>
      </div>

      <footer>
        © {new Date().getFullYear()} {BRAND} · Restauração de memórias com IA
      </footer>
    </main>
  );
}
