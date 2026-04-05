// src/components/ui/Button.jsx
import styles from '../../styles/Components.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  as: Tag = 'button',
  ...props
}) => {
  const variantClass = {
    primary: styles.btnPrimary,
    outline:  styles.btnOutline,
    ghost:    styles.btnGhost,
    danger:   styles.btnDanger,
  }[variant] || styles.btnPrimary;

  const sizeClass = {
    sm: styles.btnSm,
    md: '',
    lg: styles.btnLg,
  }[size] || '';

  const classes = [
    styles.btn,
    variantClass,
    sizeClass,
    full ? styles.btnFull : '',
    loading ? styles.btnLoading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.btnSpinner} />}
      {children}
    </Tag>
  );
};

export default Button;
