import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Navbar from '../components/navbar/Navbar'
import Profile from '../components/profile/Profile'
import Experience from '../components/experience/Experience'
import Prospects from '../components/prospects/Prospects'
import Footer from '../components/footer/Footer'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <Profile />
      <Experience />
      <Prospects />
      <Footer />
    </div>
  )
}

export default Home
