import type { ReactNode } from 'react'
import styles from './PageContent.module.css'

export const PageContent = ({ children }: { children: ReactNode }) => <div className={styles.content}>{children}</div>
