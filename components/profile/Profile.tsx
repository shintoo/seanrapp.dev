import styles from './Profile.module.css'

export default function Profile() {
  return (
    <div className="nocard" style={{marginTop: "25vh"}}>
      <img src="/avatar.jpg" className={styles.avatar} alt="Pic of me nbd" />
      <h1 style={{textAlign: "center", margin: "0"}}>Hi!</h1>
      <p style={{textAlign: "center"}}>
        I&apos;m Sean, a software engineer at Kennedy Space Center in Florida.
      </p>
    </div>
  )
}
