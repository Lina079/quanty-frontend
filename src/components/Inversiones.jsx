function Inversiones() {
  return (
    <div className="wrapper">
      <h1>Inversiones</h1>
      <p className="subtitle">Aquí conectaremos CoinGecko API</p>
      
      <div className="cards">
        <div className="card">
          <h3>Bitcoin (BTC)</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €35,420
          </p>
          <p style={{ color: '#4ADE80' }}>+12.5%</p>
        </div>

        <div className="card">
          <h3>Ethereum (ETH)</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €1,950
          </p>
          <p style={{ color: '#4ADE80' }}>+8.3%</p>
        </div>
      </div>
    </div>
  );
}

export default Inversiones;