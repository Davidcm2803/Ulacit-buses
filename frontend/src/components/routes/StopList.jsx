export default function ListaParadas({ paradas = [] }) {
  return (
    <ul className="flex flex-col gap-2">
      {paradas.map((parada, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-foreground">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <span>{parada.nombre}</span>
        </li>
      ))}
    </ul>
  );
}
