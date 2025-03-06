import React from "react";
import { Link } from "react-router-dom";

import defaultImgK from "../../images/default-kitty.jpg";
import defaultImgL from "../../images/default-letter.jpg";

import styles from "./main-card.module.css";
import { loadStripe } from "@stripe/stripe-js";
import { addToCart } from "../../utils/api";

const stripePromise = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const handleBuy = async (id) => {
  try {
    const response = await fetch(`/api/items/${id}/buy/`, { cache: "no-store" });  // Отключаем кеширование
    const result = await response.json();
    console.log("Ответ от сервера:", result);  // Проверяем что сервер отдал session_id

    if (!result.session_id) {
      throw new Error("Session ID отсутствует в ответе");
    }

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId: result.session_id });

    if (error) {
      console.error("Ошибка при редиректе в Stripe:", error);
    }
  } catch (error) {
    console.error("Ошибка при покупке товара:", error);
  }
};

const handleAddToCart = async (id) => {
  await addToCart(id);
  console.log(`Товар ${id} добавлен в корзину`);
};

export const MainCard = ({ 
  cardId,
  id,
  name = "",
  date = "",
  color = "Бежевый",
  content="",
  img,
  extraClass = "",
}) => {
  console.log("name:", id);
  console.log("date:", date);
  console.log("date:", content);
  const colorText =
    color === "black" ||
    color === "saddlebrown" ||
    color === "gray" ||
    color === "darkgray"
      ? "white"
      : "primary";

  return (
    <article className={`${styles.content} ${extraClass}`}>
      <Link className={styles.link} to={`/items/${id}`}>
        <img
          className={styles.img}
          src={img ?? (content ? defaultImgL : defaultImgK)}
          alt={content ? "Фото письма" : "Фото котика"}
        />
      </Link>
      <div className={styles.data_box}>
        <div className={styles.name_n_date_box}>
          <p
            className={`text text_type_h3 text_color_primary mt-8 mb-3 ${styles.name}`}
          >
            {name}
          </p>
          <p
            className={`text text_type_medium-20 text_color_secondary mb-8 ${styles.date}`}
          >
            {date}
          </p>
        </div>
        <button 
            className={`${styles.button} ${styles.buy_now}`} 
            onClick={() => handleBuy(id)}
          >
          Купить сейчас
        </button>
        <button 
            className={`${styles.button} ${styles.buy_now}`} 
            onClick={() => handleAddToCart(id)}
          >
          Добавить в корзину
        </button>
        {/* <div
          className={styles.cat_color_box}
          style={{ backgroundColor: color }}
        >
          <p
            className={`text text_type_medium-20 text_color_${colorText} ${styles.cat_color}`}
          >
            {color}
          </p>
        </div> */}
      </div>
    </article>
  );
};
