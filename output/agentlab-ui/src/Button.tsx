import React, { type ButtonHTMLAttributes } from "react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-5 py-2.5 font-inter text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const variants = {
    primary:
      "bg-cyan-500 text-navy-950 border border-transparent hover:bg-cyan-400 hover:shadow-cyan-glow focus:ring-cyan-500",
    secondary:
      "bg-navy-800 text-white border border-navy-700 hover:border-cyan-400 hover:bg-navy-700 hover:shadow-cyan-glow focus:ring-cyan-500",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
