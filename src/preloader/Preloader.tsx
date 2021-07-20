import preloader from "./loader.svg";
import React from "react";
import styles from "./Preloader.module.css"

const Preloader = () => {
   return <img src={preloader} className={styles.preloader} alt=""/>
}
export default Preloader
