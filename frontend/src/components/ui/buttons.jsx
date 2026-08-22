function BaseButton({
  icon: Icon,
  name,
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  reverse = false,
  ...rest
}) {
  const content = children || name;
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 active:scale-[0.98] ${className}`}
      {...rest}
    >
      {reverse ? (
        <>
          <span>{content}</span>
          {Icon && <Icon size={16} className="flex-shrink-0" />}
        </>
      ) : (
        <>
          {Icon && <Icon size={16} className="flex-shrink-0" />}
          <span>{content}</span>
        </>
      )}
    </button>
  );
}

export function PrimaryButton(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/20 border border-purple-400/20 ${
        props.className || ""
      }`}
    />
  );
}

export function Black100Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:text-white-100 ${
        props.className || ""
      }`}
    />
  );
}

export function Black200Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:text-white-100 hover:border-white/[0.12] ${
        props.className || ""
      }`}
    />
  );
}

export function White100Button(props) {
  return (
    <BaseButton
      {...props}
      className={`text-black-100 bg-white-100 hover:bg-white-200 font-bold shadow-md ${
        props.className || ""
      }`}
    />
  );
}

export function GlassButton(props) {
  return (
    <BaseButton
      {...props}
      className={`text-white bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/[0.15] shadow-lg ${
        props.className || ""
      }`}
    />
  );
}
