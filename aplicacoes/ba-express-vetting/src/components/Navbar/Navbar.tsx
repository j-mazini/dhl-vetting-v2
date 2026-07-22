import Link from "next/link";
import { BUSINESS_RULES } from "@/constants/businessRules";
import styles from "./Navbar.module.css";

/**
 * Main navigation using strict domain routes.
 */
export function Navbar() {
  const { ROUTE } = BUSINESS_RULES;

  return (
    <header className={styles.header}>
      <Link href={ROUTE.HOME} className={styles.logo}>
        LogixSphere
      </Link>
      
      <nav className={styles.nav}>
        <Link href={ROUTE.HOME} className={styles.link}>
          Home
        </Link>
        <Link href={ROUTE.ABOUT} className={styles.link}>
          About
        </Link>
        <Link href={ROUTE.FEATURES} className={styles.link}>
          Features
        </Link>
        <Link href={ROUTE.CONTACT} className={styles.link}>
          Contact
        </Link>
      </nav>
    </header>
  );
}
