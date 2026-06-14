import { Link } from "react-router-dom";

export default function AdminRutas() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rutas</h1>
        <Link
          to="/admin/rutas/nueva"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Nueva ruta
        </Link>
      </div>
    </div>
  );
}