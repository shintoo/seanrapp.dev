import styles from './Experience.module.css'
import Flink from '../flink/Flink'

export default function Experience() {
  return (
    <div id="experience" className="nocard">
      <h1>
<svg className="underline" width="344" height="36" viewBox="0 5 610 10" fill="none">
  <path opacity="0.5" strokeWidth="30" strokeLinejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>

      What I&apos;m Working On <span style={{fontSize: "1rem", verticalAlign: "super", fontWeight: "normal"}}>[professionally]</span></h1>
      <p>
        Since 2019, I have worked in a lab in the Launch Control Center that provides
        vehicle telemetry simulation as a service.
      </p>
      <img src="/lcc-ft-me.png" className={styles.vab} alt="Pic of me nbd" />
      <p>
        My work has included developing an <strong>automation dashboard</strong>,
        creating a telemetry packing <strong>database</strong> generator,
        improving simulator <strong>performance</strong>,
        implementing new simulator functionality, and plenty other I&apos;m forgetting.
        It is primarily development in Python and TypeScript, with tools such as GitLab CI/CD,
        VMWare vCenter, NextJs, FastAPI, Ansible, and PostgreSQL, amongst others.
      </p>
      <div className={styles.imagerow}>
        <img src="/sls.jpg" className={styles.circleimage} alt="SLS" />
        <img src="/orion.jpg" className={styles.circleimage} alt="Orion" />
        <img src="/icps.jpg" className={styles.circleimage} alt="ICPS" />
      </div>
      <hr className={styles.divider}/>
      <p>
        Previously, I have worked with <i>Swamp Works</i>, a rapid development lab
        at Kennedy Space Center,
        working on a regolith-mining rover. This rover has a goal of collecting
        materials for habitat building,
        rocket propellant production, or tool manufacturing. I contributed to
        simulations development, deployment pipelines, and networking.
      </p>
      <div className={styles.imagerow}>
        <img src="/rassor1.jpg" className={styles.circleimage} alt="Rassor" />
        <img src="/rassor2.jpg" className={styles.circleimage} alt="Rassor" />
      </div>
      <p>
        I have also spent some time
        working on a training simulator for the Hawk T2 jet trainer with Lockheed Martin.
      </p>
      <h1 id="projects">
      
<svg className="underline" width="344" height="36" viewBox="0 5 500 10" fill="none">
  <path opacity="0.5" strokeWidth="30" strokeLinejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>
      What Else I&apos;m Working On <span style={{fontSize: "1rem", verticalAlign: "super", fontWeight: "normal"}}>[for fun]</span></h1>
      <p>I am currently working on a super secret, spaced-repitition wildlife identification learning tool with auto-generated card decks.
        (Think &quot;I want to be able to identify all of the birds found in Florida during the spring.&quot;) More to come on that soon ;)
      </p>
      <p>
        My latest project is Darwin (
        <Flink href="https://darwintree.app">darwintree.app</Flink>),
        a webapp for searching biological taxa and building phylogenetic trees. It works with two
        of my favorite sites/apps,
        eBird and iNaturalist, letting
        users import recent birdwatching lists or other nature-y observations.
        It is my favorite thing I have ever made. It even has a <Flink href="https://github.com/shintoo/darwin-browser-extension">browser extension</Flink>!
      </p>
      <a className={styles.darwincontainer} href="https://darwintree.app/b/Common_Florida_Birds-1hG-2vpp-1hW-hzM-17O-3-28ak-Yv-2mv-1SX-28J" target="_blank" rel="noreferrer"><img src="/darwin.png" className={styles.darwin} alt="https://darwintree.app" /></a>
      <p>Most of my projects are up for viewing on my <Flink href="https://github.com/shintoo">GitHub</Flink>.</p>
    </div>
  )
}
