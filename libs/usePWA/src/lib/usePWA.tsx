import styles from './usePWA.module.css';

/* eslint-disable-next-line */
export interface UsePWAProps {}

export function UsePWA(props: UsePWAProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to UsePWA!</h1>
    </div>
  );
}

export default UsePWA;
