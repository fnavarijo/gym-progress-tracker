interface OptionProps {
  id: string;
  value: string;
  name: string;
  // Add the right type
  ref?: any;
}

interface OptionGroupOptions {
  id: string;
  value: string;
  ref?: any;
}

interface OptionGroupProps {
  name: string;
  className: string;
  options: OptionGroupOptions[];
}

export function Option({ id, value, name, ref }: OptionProps) {
  return (
    <div>
      <input
        type="radio"
        id={id}
        value={value}
        name={name}
        ref={ref}
        className="absolute opacity-0 pointer-events-none"
      />
      <label htmlFor={id}>
        <div className="flex flex-col items-center rounded-sm bg-card border-[1px] border-gray-700 transition-colors p-4 hover:border-primary">
          <span className="text-primary">{value}</span> weeks
        </div>
      </label>
    </div>
  );
}

export function OptionGroup({ name, className, options }: OptionGroupProps) {
  return (
    <div className={`${className} flex w-full justify-between`}>
      {options.map((props, index) => (
        <Option key={index} {...props} name={name} />
      ))}
    </div>
  );
}
