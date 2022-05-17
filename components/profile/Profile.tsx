import styles from './Profile.module.css'

export default function Profile() {
  const skills = [
    { skill: "Python", color: "#3870A1" },
    { skill: "Javascript", color: "#E9CD50" },
    { skill: "Typescript", color: "#2F72BC" },
    { skill: "React", color: "#5ED3F3" },
    { skill: "HTML", color: "#DD4B25" },
    { skill: "CSS", color: "#254BDD" },
    { skill: "C", color: "#3744A7" },
    { skill: "C++", color: "#005697" },
    { skill: "Java", color: "#F0931C"},
    { skill: "Linux", color: "#EFB80F" },
    { skill: "Bash", color: "#272E35" },
    { skill: "Docker", color: "#2392E6" },
    { skill: "PostgreSQL",  color: "#336791" }
  ].map(s =>
    <span key={s.skill} style={{background: s.color}}>{s.skill}</span>
  )

  return (
    <div className="nocard" style={{marginTop: "20vh"}}>
      <img src="/avatar.jpg" className={styles.avatar} alt="Pic of me nbd" />
      <h1 style={{textAlign: "center", margin: "0"}}>Hi!</h1>
      <p style={{textAlign: "center"}}>
        I&apos;m Sean, a software engineer at Kennedy Space Center in Florida.
      </p>
      <div className={styles.skills}>
        {skills}
      </div>
    </div>
  )
}
