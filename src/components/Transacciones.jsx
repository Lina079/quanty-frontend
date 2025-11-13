function Transacciones() {
  const transactions = [
    { id: 1, type: 'Ingreso', category: 'Sueldo', amount: 2500, date: '2025-01-31' },
    { id: 2, type: 'Gasto', category: 'Mercado', amount: -85, date: '2025-01-28' },
    { id: 3, type: 'Ahorro', category: 'Reserva', amount: 500, date: '2025-01-25' },
  ];

  return (
    <div className="wrapper">
      <h1>Transacciones</h1>
      <p className="subtitle">Historial de tus movimientos financieros</p>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {transactions.map(tx => (
          <div key={tx.id} className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{tx.category}</h3>
                <p style={{ fontSize: '14px' }}>{tx.type} • {tx.date}</p>
              </div>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: tx.amount > 0 ? '#4ADE80' : '#EF4444' 
              }}>
                {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transacciones;