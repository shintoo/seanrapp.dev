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
        Since January 2023, I have been working at the <Flink href="https://www.stsci.edu">Space Telescope Science Institute (STScI)</Flink> as a software engineer, developing applications
        used by engineers to monitor data calibration and manage data archive systems. I also work on APIs used by astronomers
        to search for and retrieve data from the Hubble Space Telescope and the James Webb Space Telescopes.
        (And soon, the <Flink href="https://roman.gsfc.nasa.gov/">Roman Space Telescope</Flink>!)
      </p>
      <div className={styles.imagerow}>
        <img src="/hubble.jpg" className={styles.circleimage} alt="Hubble" />
        <img src="/jwst.jpg" className={styles.circleimage} alt="JWST" />
        <img src="/jwst-carina.png" className={styles.circleimage} alt="Carina Nebula" />
      </div>

      <hr className={styles.divider}/>
      <p>
        Before starting at STScI, I worked in a lab in the Launch Control Center at Kennedy Space Center that provides
        vehicle telemetry simulation for the Space Launch System and Orion spacecraft, supporting the Artemis program.
        We successfully launched <Flink href="https://www.nasa.gov/mission/artemis-i/">Artemis I</Flink>, and Artemis II
        is on the way.
      </p>
      <img src="/lcc-ft-me.png" className={styles.vab} alt="LCC and VAB" />
      <p>
        The telemetry simulation system I worked on is used to train the launch team, better preparing them for handling
        any situation that may arise while preparing the rocket and spacecraft for launch. It is also used for testing
        the Launch Control System and the Ground/Flight Application Software, letting engineers work with simulated
        rocket and spacecraft data without needing to connect to the real thing.
      </p>
      <p>
        My work particularly included building a database for tracking telemetry and commanding data models,
        creating an automation dashboard for managing simulation deployments,
        and maximizing simulation performance.
      </p>
      <div className={styles.imagerow}>
        <img src="/sls.jpg" className={styles.circleimage} alt="SLS" />
        <img src="/orion.jpg" className={styles.circleimage} alt="Orion" />
        <img src="/icps.jpg" className={styles.circleimage} alt="ICPS" />
      </div>
      <hr className={styles.divider}/>
      <p>
        I have also worked with <i>Swamp Works</i>, a rapid development lab
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

      <h1 id="volunteering">
      
<svg className="underline" width="344" height="36" viewBox="0 5 500 10" fill="none">
  <path opacity="0.5" strokeWidth="30" strokeLinejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>
      Volunteering</h1>

      <p>I currently volunteer <Flink href="https://www.sjastudy.org/">Study Japanese Arlington (SJA)</Flink>,
        a local non-profit in Arlington, VA that advocates for Japanese study opportunities with Arlington Public Schools.
        We also host plenty of Japanese cultural and language-learning events! I volunteer as the website maintainer, as well as
        occasionally leading our weekly Japanese Conversation classes at the Arlington County Central Library.
      </p>

      <div className={styles.imagerow}>
        <img src="/kaminari-mon.jpg" className={styles.circleimage} alt="Me in Asakusa, Japan" />
      </div>
      
      <h1 id="projects">
<svg className="underline" width="344" height="36" viewBox="0 5 500 10" fill="none">
  <path opacity="0.5" strokeWidth="30" strokeLinejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>
      What Else I&apos;m Working On <span style={{fontSize: "1rem", verticalAlign: "super", fontWeight: "normal"}}>[for fun]</span></h1>
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
