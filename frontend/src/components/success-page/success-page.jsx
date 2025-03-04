import React from 'react';
import styles from "./success-page.module.css"
import { useEffect } from "react";

export const SuccessPage = () => {


  useEffect(() => {
    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (orderId) {
      fetch(`/api/order/${orderId}/clear_order/`, { 
        method: "POST",  
        headers: {
          "Content-Type": "application/json",
          authorization: `Token ${localStorage.getItem("auth_token")}`, 
       }
      })
        .then((res) => res.json())
        .then((data) => console.log("Корзина очищена:", data))
        .catch((err) => console.error("Ошибка очистки заказа:", err));
    }
  }, []);

  return (
    <div className={styles.successPage}>
      <div className={styles.card}>
        <svg className={styles.checkIcon} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <h1 className={styles.successTitle}>Оплата успешна!</h1>
        <p className={styles.successDescription}>Спасибо за покупку.</p>
        <a href="/" className={styles.backButton}>На главную</a>
      </div>
    </div>
  );
};
