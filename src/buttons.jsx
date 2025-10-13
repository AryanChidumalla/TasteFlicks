function BaseButton({
  icon: Icon,
  name,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  reverse = false,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex items-center justify-center px-5 py-2.5 text-sm font-semibold transition rounded hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {reverse ? (
        <>
          {name}
          {Icon && <Icon size={20} weight="bold" className="ml-2" />}
        </>
      ) : (
        <>
          {Icon && <Icon size={20} weight="bold" className="mr-2" />}
          {name}
        </>
      )}
    </button>
  );
}

export function PrimaryButton(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white bg-primary-100 hover:bg-primary-200 border border-primary-200 ${
        props.className || ""
      }`}
    />
  );
}

export function Black100Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white bg-black-100 hover:bg-black-200 border border-black-200 ${
        props.className || ""
      }`}
    />
  );
}

export function Black200Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white bg-black-200 hover:bg-black-300 border border-black-300 ${
        props.className || ""
      }`}
    />
  );
}

export function White100Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-black-100 bg-white-100 hover:bg-white-300 border border-white-100 ${
        props.className || ""
      }`}
    />
  );
}
