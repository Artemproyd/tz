import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import returnIcon from "../../images/left.svg";
import addImgIcon from "../../images/image.svg";

import { ButtonForm } from "../ui/button-form/button-form";
import { ButtonSecondary } from "../ui/button-secondary/button-secondary";
import { Input } from "../ui/input/input";

import styles from "./add-card-page.module.css";

export const AddItemPage = ({ extraClass = "" }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [errorName, setErrorName] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorPrice, setErrorPrice] = useState("");
  const history = useHistory();

  const handleReturn = () => {
    history.goBack();
  };

  const handleSubmit = () => {
    // Валидация полей
    let isValid = true;

    if (!name.trim()) {
      setErrorName("Название не может быть пустым");
      isValid = false;
    } else {
      setErrorName("");
    }

    if (!description.trim()) {
      setErrorDescription("Описание не может быть пустым");
      isValid = false;
    } else {
      setErrorDescription("");
    }

    if (!price.trim() || isNaN(price) || Number(price) <= 0) {
      setErrorPrice("Цена должна быть числом больше 0");
      isValid = false;
    } else {
      setErrorPrice("");
    }

    if (!isValid) return;

    // Создание товара
    createItem({ name, description, price: Number(price) })
      .then((res) => {
        if (res) {
          history.push(`/items/${res.id}`); // Перенаправляем на страницу товара
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorName("Ошибка при создании товара");
      });
  };

  return (
    <div className={`${styles.content} ${extraClass}`}>
      <h2 className="text text_type_h2 text_color_primary mt-25 mb-9">
        Новый товар
      </h2>
      <ButtonSecondary
        extraClass={styles.return_btn_mobile}
        icon={returnIcon}
        onClick={handleReturn}
      />
      <div className={styles.container}>
        <Input
          type="text"
          placeholder="Название товара"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorName}
        />
        <Input
          type="text"
          placeholder="Описание товара"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errorDescription}
        />
        <Input
          type="number"
          placeholder="Цена товара"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errorPrice}
        />
        <ButtonForm
          extraClass={styles.submit_btn}
          text="Сохранить"
          onClick={handleSubmit}
        />
        <ButtonSecondary
          extraClass={styles.return_btn}
          icon={returnIcon}
          onClick={handleReturn}
        />
      </div>
    </div>
  );
};

