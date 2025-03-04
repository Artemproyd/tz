import React from "react";
import styles from "./card-page.module.css";
import returnIcon from "../../images/left.svg";
import defaultImg from "../../images/default-kitty.jpg";

import { useHistory, useParams } from "react-router-dom";
import { ButtonSecondary } from "../ui/button-secondary/button-secondary";
import { getItem } from "../../utils/api";
import { loadStripe } from "@stripe/stripe-js";
import { ButtonForm } from "../ui/button-form/button-form";

const stripePromise = loadStripe("pk_test_51QxY3xA9bDJlznD3w2ePZuHjl57WtjnQ9OfPHEXuJ2Ebc9UecUG5Jb74pDFBC311tdwxx0R3w2DMCuMrDztIF8oA00Hg7jy4mM");

export const ItemPage = ({ data, setData, extraClass = "" }) => {
  const history = useHistory();
  const params = useParams();

  React.useEffect(() => {
    getItem(params.id).then((res) => {
      if (res && res.id) {
        setData(res);
      }
    });
  }, [params.id, setData]);

  const handleReturn = () => {
    setData({});
    history.push("/");
  };

  const handleBuy = async () => {
    try {
      const response = await fetch(`/api/items/${data.id}/buy/`, { cache: "no-store" });
      const result = await response.json();
      console.log("Ответ от сервера:", result);

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

  return (
    <article className={`${styles.content} ${extraClass}`}>
      <div className={styles.container}>
        <div className={styles.btns_box_mobile}>
          <ButtonSecondary
            extraClass={styles.mobile_btn}
            icon={returnIcon}
            onClick={handleReturn}
          />
        </div>
        <div className={styles.img_box}>
          <img
            className={styles.img}
            src={data.image_url ?? defaultImg}
            alt="Фото товара."
          />
        </div>
        <ButtonSecondary
          extraClass={`${styles.desktop_btn} ${styles.desk_return}`}
          icon={returnIcon}
          onClick={handleReturn}
        />
      </div>
      <p className={`text text_type_h2-5 text_color_primary mt-35 mb-10 ${styles.name}`}>
        {data.name}
      </p>
      <p className={`text text_type_h3 text_color_secondary ${styles.date}`}>
        Цена: {data.price} ₽
      </p>
      <p className={`text text_type_h3 ${styles.description}`}>
        {data.description}
      </p>
      <ButtonForm
        extraClass={styles.buy_btn}
        text="Купить"
        onClick={handleBuy}
      />
    </article>
  );
};
