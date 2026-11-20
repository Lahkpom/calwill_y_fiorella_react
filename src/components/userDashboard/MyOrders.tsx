interface MyOrdersProps {
  mode: 'active' | 'history';
}

const MyOrders = ({ mode }: MyOrdersProps) => {
  const title = mode === 'active' ? 'Órdenes activas' : 'Historial';

  return (
    <section className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="h4 card-title mb-0">{title}</h2>
      </div>
    </section>
  );
};

export default MyOrders;
