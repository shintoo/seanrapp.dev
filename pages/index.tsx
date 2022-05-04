import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Profile from '../components/profile/Profile'
import Experience from '../components/experience/Experience'
import Prospects from '../components/prospects/Prospects'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Profile />
      <Experience />
      <Prospects />
    </div>
  )
}

export default Home
