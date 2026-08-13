import Select from "react-select";

export default function SelectField({ label, value, onChange, options = [], placeholder = "Seleccionar" }) {
  const opciones = options.map((op) => ({ value: op, label: op }));
  const seleccionado = opciones.find((op) => op.value === value) ?? null;

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <Select
        value={seleccionado}
        onChange={(op) => onChange(op ? op.value : "")}
        options={opciones}
        placeholder={placeholder}
        isSearchable
        unstyled
        classNamePrefix="rs"
        classNames={{
          control: ({ isFocused }) =>
            `!min-h-0 !rounded-md !border !bg-[var(--color-card)] !px-2 !py-1.5 !text-sm !text-foreground ${
              isFocused ? "!border-primary !ring-1 !ring-primary" : "!border-border"
            }`,
          placeholder: () => "!text-muted-foreground",
          singleValue: () => "!text-foreground",
          input: () => "!text-foreground",
          indicatorSeparator: () => "!hidden",
          dropdownIndicator: () => "!text-muted-foreground",
          menu: () => "!mt-1 !rounded-md !border !border-border !bg-[var(--color-card)] !shadow-lg !z-50",
          menuList: () => "!py-1",
          option: ({ isFocused, isSelected }) =>
            `!cursor-pointer !px-3 !py-2 !text-sm ${
              isSelected
                ? "!bg-primary !text-primary-foreground"
                : isFocused
                  ? "!bg-muted !text-foreground"
                  : "!text-foreground"
            }`,
          noOptionsMessage: () => "!text-muted-foreground !text-sm !py-2",
        }}
      />
    </div>
  );
}