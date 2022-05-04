import styles from './Experience.module.css'
import Flink from '../flink/Flink'

export default function Experience() {
  return (
    <div className="nocard">
      <h1>
<svg class="underline" width="344" height="36" viewBox="0 5 610 10" fill="none">
  <path opacity="0.5" stroke-width="30" stroke-linejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>

      What I&apos;m Working On <span style={{fontSize: "1rem", verticalAlign: "super", fontWeight: "normal"}}>[professionally]</span></h1>
      <p>
        Since 2019, I have worked in a lab in the Launch Control Center that provides
        vehicle telemetry simulation as a service.
      </p>
      <img src="/lcc-ft-me.png" className={styles.vab} alt="Pic of me nbd" />
      <p>
        My work has included <strong>automating simulator testing</strong>,
        creating a telemetry packing <strong>database</strong> generator,
        improving simulator <strong>performance</strong>,
        implementing new simulator functionality, and plenty other I&apos;m forgetting.
        It is primarily development in Python, with tools such as GitLab CI/CD,
        VMWare vCenter, and PostgreSQL, amongst others.
      </p>
      <p>
        In the past, I have spent some time at Lockheed Martin,
        working on a training simulator for the Hawk T2 jet trainer.
      </p>
      <h1>
      
<svg class="underline" width="344" height="36" viewBox="0 5 500 10" fill="none">
  <path opacity="0.5" stroke-width="30" stroke-linejoin="round" d="M3 21C20.1231 17.8525 37.9303 16.8192 55.3857 16.0719C84.6481 14.819 114.132 14.5194 143.388 15.9599C169.598 17.2503 195.455 20.3554 221.642 17.7519C228.347 17.0853 237.394 16.9679 244 16.9679"></path>
</svg>
      What Else I&apos;m Working On <span style={{fontSize: "1rem", verticalAlign: "super", fontWeight: "normal"}}>[for fun]</span></h1>
      <p>
        The last project I started was&nbsp;
        <Flink href="https://darwintree.app">darwintree.app</Flink>
        , a webapp for searching biological taxa and building phylogenetic trees. It works with two
        of my favorite sites/apps,
        eBird and iNaturalist, letting
        users import recent birdwatching lists or other nature-y observations.
        It is my favorite thing I have ever made. It even has a <Flink href="https://github.com/shintoo/darwin-browser-extension">browser extension</Flink>!
      </p>
      <p>Most of my projects are up for viewing on my <Flink href="https://github.com/shintoo">GitHub</Flink>.</p>
    </div>
  )
}
