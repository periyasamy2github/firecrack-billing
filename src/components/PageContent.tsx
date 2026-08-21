import type { ReactNode } from 'react'
import styles from '../css/components/PageContent.module.css'

export const PageContent = ({ children }: { children: ReactNode }) => <div className={styles.content}>{children}</div>
