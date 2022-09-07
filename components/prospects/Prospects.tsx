import styles from './Prospects.module.css'

export default function Prospects() {
  return (
    <div className="nocard" id="connect">
      <h1>
<svg className="underline" width="344" height="36" viewBox="0 5 550 10" fill="none">
  <path opacity="0.5" strokeWidth="30" strokeLinejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>
        What I Like to Work On
      </h1>
      <p>
        In terms of tools, I am at home with <strong>Python</strong>. I also really enjoy working
        with <strong>React</strong>. I have done a number of projects in Java and C, and enjoy
        playing around in assembly sometimes. I am at home in a Linux environment.
      </p>
      <p>I love working on space systems. I am also passionate about conservation.</p>
      <div className={styles.container}>
      <a href="mailto:seanprapp@gmail.com" target="_blank" rel="noopener noreferrer">
        <div className={styles.button1}>
          email me
        </div>
      </a>
      <a href="/resume-05-04-2022.pdf" target="_blank" rel="noopener noreferrer">
        <div className={styles.button2}>
          download cv
        </div>
      </a>
      </div>
    </div>

  )
}
