import React from "react";
import styles from "./cancel-page.module.css";

export const CancelPage = () => {
  return (
    <div className={styles.cancelPage}>
      <div className={styles.card}>
        <svg className={styles.cancelIcon} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h1 className={styles.cancelTitle}>Оплата не удалась</h1>
        <p className={styles.cancelDescription}>К сожалению, произошла ошибка при оплате. Попробуйте снова.</p>
        <a href="/" className={styles.backButton}>Вернуться на главную</a>
      </div>
    </div>
  );
};

