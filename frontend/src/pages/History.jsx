import { useHistory } from "../hooks/useHistory";

function History() {
  const { historial, loading, error } = useHistory();

  if (loading) return <p className="p-6 text-center">Cargando historial...</p>;
  if (error) return <p className="p-6 text-center text-red-500">Error: {error}</p>;
  if (historial.length === 0) {
    return <p className="p-6 text-center text-gray-500">No tenés búsquedas todavía.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Historial de búsquedas</h2>
      <ul className="space-y-3">
        {historial.map((item) => (
          <li key={item._id} className="border rounded-lg p-4 shadow-sm">
            <p className="font-semibold">{item.origen_buscado} → {item.destino_buscado}</p>
            <p className="text-sm text-gray-500">
              {new Date(item.consultado_en).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;