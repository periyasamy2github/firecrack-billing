import styles from '../css/components/KeyBadge.module.css'

export const KeyBadge = ({ label }: { label: string }) => <span className={styles.badge}>{label}</span>
