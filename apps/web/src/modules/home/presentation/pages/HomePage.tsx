export function HomePage() {
  return (
    <section className="page-section" aria-labelledby="home-title">
      <p className="eyebrow">Inicio</p>
      <h1 id="home-title">Tu hogar empieza aqui</h1>
      <p className="lead">
        Cuando completes la configuracion, encontraras en este espacio el plan
        de hoy y las acciones principales.
      </p>
      <div className="empty-state">
        <div className="empty-state__illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>Aun no hay informacion para mostrar</h2>
        <p>Los datos de tu familia apareceran aqui.</p>
      </div>
    </section>
  );
}
