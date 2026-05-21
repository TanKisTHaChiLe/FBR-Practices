import React from 'react';

export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU').format(date);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '3rem auto',
    padding: '0 1.75rem',
    fontFamily: 'sans-serif',
  },
  heading: {
    fontSize: '2rem',
    color: '#20243a',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#5f6de0',
    color: '#fff',
    borderRadius: '4px',
    padding: '0.2rem 0.6rem',
    fontSize: '0.85rem',
    marginRight: '0.5rem',
  },
  card: {
    marginTop: '2rem',
    padding: '1.75rem',
    border: '1px solid #d9dceb',
    borderRadius: '8px',
    backgroundColor: '#fbfbfe',
    boxShadow: '0 8px 24px rgba(32, 36, 58, 0.08)',
  },
};

function Home() {
  const today = formatDate(new Date());

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Главная страница</h1>
      <p>Сегодня: <strong>{today}</strong></p>

      <div style={styles.card}>
        <h2>Оптимизации в этом проекте</h2>
        <ul>
          <li><span style={styles.badge}>Lazy Loading</span> страница «О нас» загружается по требованию</li>
          <li><span style={styles.badge}>Code Splitting</span> vendor, router и app — отдельные чанки</li>
          <li><span style={styles.badge}>Tree-shaking</span> неиспользуемые функции удаляются из бандла</li>
          <li><span style={styles.badge}>Хэширование</span> имена файлов содержат хэш содержимого</li>
          <li><span style={styles.badge}>Visualizer</span> после <code>npm run build</code> открывается bundle-report.html</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
