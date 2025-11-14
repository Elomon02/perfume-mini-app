import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    axios.get('https://your-backend.up.railway.app/api/products')
      .then(res => setProducts(res.data));
  }, []);

  const addToCart = (id, qty) => {
    if (qty < 1) return;
    setCart(prev => ({ ...prev, [id]: qty }));
    WebApp.HapticFeedback.impactOccurred('light');
  };

  const sendOrder = () => {
    if (!form.name || !form.address || !form.phone) {
      WebApp.showAlert('Barcha maydonlarni to\'ldiring!');
      return;
    }
    if (Object.keys(cart).length === 0) {
      WebApp.showAlert('Savatcha bo\'sh!');
      return;
    }

    WebApp.sendData(JSON.stringify({
      action: 'order',
      name: form.name,
      address: form.address,
      phone: form.phone
    }));

    setCart({});
    setForm({ name: '', address: '', phone: '' });
    setShowCart(false);
  };

  const getImage = (id) => `https://api.telegram.org/file/bot${import.meta.env.VITE_BOT_TOKEN}/${id}`;

  const total = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0', fontSize: '24px', fontWeight: 'bold' }}>
        Parfumeriya
      </h1>

      {!showCart ? (
        <div>
          {products.map(p => (
            <div key={p._id} className="card">
              {p.imageId && <img src={getImage(p.imageId)} alt={p.name} />}
              <div className="card-body">
                <h3 style={{ fontWeight: 'bold' }}>{p.name}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{p.description}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="1"
                    onChange={e => addToCart(p._id, +e.target.value || 1)}
                  />
                  <button className="btn" onClick={() => addToCart(p._id, (cart[p._id] || 0) + 1)}>
                    Savatchaga
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '16px' }}>Savatcha</h2>
          {Object.entries(cart).map(([id, qty]) => {
            const p = products.find(x => x._id === id);
            return p ? <div key={id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              {p.name} × {qty}
            </div> : null;
          })}

          <input placeholder="Ismingiz" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" style={{ width: '100%', marginTop: '16px' }} />
          <input placeholder="Manzil" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" style={{ width: '100%', marginTop: '8px' }} />
          <input placeholder="Telefon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" style={{ width: '100%', marginTop: '8px' }} />

          <button onClick={sendOrder} className="btn" style={{ width: '100%', marginTop: '16px', background: '#10b981' }}>
            Buyurtma berish
          </button>
          <button onClick={() => setShowCart(false)} style={{ width: '100%', marginTop: '8px', background: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '12px' }}>
            Orqaga
          </button>
        </div>
      )}

      {total > 0 && !showCart && (
        <button className="cart-btn" onClick={() => setShowCart(true)}>
          {total}
        </button>
      )}
    </div>
  );
}