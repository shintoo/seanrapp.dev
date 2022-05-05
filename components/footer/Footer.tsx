import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <a href="https://www.linkedin.com/in/sean-p-rapp" target="_blank" referrer="noreferrer">linkedin</a>&nbsp;|&nbsp;
        <a href="https://twitter.com/ksc_sean">twitter</a>
      </div>
    </footer>
  )
}
