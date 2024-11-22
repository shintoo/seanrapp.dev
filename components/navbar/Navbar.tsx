import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [ scrolled, setScrolled ] = useState(false)
  const navbarClasses = [styles.navbar, styles.sticky]

  return (
    <div className={navbarClasses.join(" ")}>
      <Link href="/"><div className={styles.logo}>./sean</div></Link>
      <Link href="#experience"><div className={[styles.navlink, ].join(" ")}>exp</div></Link>
      <Link href="#projects"><div className={[styles.navlink, ].join(" ")}>proj</div></Link>
    </div>
  )
}
