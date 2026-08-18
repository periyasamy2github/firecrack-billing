import styles from './KeyBadge.module.css'

/** A small keyboard-key chip, e.g. F2 or "/". */
export const KeyBadge = ({ label }: { label: string }) => <span className={styles.badge}>{label}</span>
