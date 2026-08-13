import { useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

function hoyISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function sumarDias(base, dias) {
  const [y, m, d] = base.split("-").map(Number);
  const fecha = new Date(y, m - 1, d + dias);
  const offset = fecha.getTimezoneOffset();
  const local = new Date(fecha.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function partesFecha(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return {
    diaSemana: fecha.toLocaleDateString("es-CR", { weekday: "short" }).replace(".", ""),
    diaNumero: fecha.getDate(),
    mes: fecha.toLocaleDateString("es-CR", { month: "short" }).replace(".", ""),
  };
}

export default function SelectorFecha({ value, onChange, diasAdelante = 10 }) {
  const min = hoyISO();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const arrastrando = useRef(false);
  const inicioX = useRef(0);
  const inicioScroll = useRef(0);
  const seMovio = useRef(false);

  const opciones = Array.from({ length: diasAdelante }, (_, i) => sumarDias(min, i));

  function abrirCalendario() {
    if (inputRef.current?.showPicker) inputRef.current.showPicker();
    else inputRef.current?.focus();
  }

  function desplazar(direccion) {
    scrollRef.current?.scrollBy({ left: direccion * 160, behavior: "smooth" });
  }

  function onPointerDown(e) {
    arrastrando.current = true;
    seMovio.current = false;
    inicioX.current = e.clientX;
    inicioScroll.current = scrollRef.current.scrollLeft;
  }

  function onPointerMove(e) {
    if (!arrastrando.current) return;
    const delta = e.clientX - inicioX.current;
    if (Math.abs(delta) > 4) seMovio.current = true;
    scrollRef.current.scrollLeft = inicioScroll.current - delta;
  }

  function onPointerUp() {
    arrastrando.current = false;
  }

  // evita que un arrastre dispare el click del botón de fecha
  function onClickCapture(e) {
    if (seMovio.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-muted-foreground">
        Día del viaje
      </label>

      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => desplazar(-1)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted sm:flex"
          aria-label="Ver fechas anteriores"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClickCapture={onClickCapture}
            className="flex cursor-grab gap-2 overflow-x-auto pb-1 pr-8 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {opciones.map((fecha, i) => {
              const { diaSemana, diaNumero, mes } = partesFecha(fecha);
              const activo = value === fecha;
              const etiqueta = i === 0 ? "Hoy" : i === 1 ? "Mañana" : diaSemana;
              return (
                <button
                  key={fecha}
                  type="button"
                  onClick={() => onChange(fecha)}
                  className={`flex w-14 shrink-0 flex-col items-center rounded-lg border px-2 py-2 transition-colors ${
                    activo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`text-[11px] capitalize ${activo ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {etiqueta}
                  </span>
                  <span className="text-lg font-bold leading-tight">{diaNumero}</span>
                  <span className={`text-[10px] capitalize ${activo ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {mes}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={abrirCalendario}
              className="flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Calendar size={16} />
              <span className="text-[10px]">Otra</span>
            </button>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        </div>

        <button
          type="button"
          onClick={() => desplazar(1)}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted sm:flex"
          aria-label="Ver fechas siguientes"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <input
        ref={inputRef}
        type="date"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}

export { hoyISO };