import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function LinkButton({
  className,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={getButtonClassName({ variant, size, className })} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </Link>
  );
}

