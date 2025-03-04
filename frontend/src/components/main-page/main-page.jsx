import React from "react";

import { getItems } from "../../utils/api";

import { MainCard } from "../main-card/main-card";
import { PaginationBox } from "../pagination-box/pagination-box";

import styles from "./main-page.module.css";

export const MainPage = ({ queryPage, setQueryPage, extraClass = "" }) => {
  const [items, setItems] = React.useState([]);
  const [pagData, setPagData] = React.useState({});

  React.useEffect(() => {
    Promise.all([
      getItems(queryPage),
    ])
      .then(([itemsRes]) => {
        setPagData({
          count: itemsRes.count,
          pages: Math.ceil(itemsRes.count / 10),
        });
        setItems(itemsRes.results);
      })
      .catch((err) => console.error(err));
  }, [queryPage, setQueryPage]);

  return (
    <section className={`${styles.content} ${extraClass}`}>
      {/* <h2 className={`text text_type_h2 text_color_primary mt-25 mb-20 ${styles.title}`}>
        Замечательные коты
      </h2>
      <div className={styles.box}>
        {cards.map((item) => (
          <MainCard key={item.id} img={item.image_url} name={item.name} date={item.birth_year} color={item.color} />
        ))}
      </div> */}

      <h2 className={`text text_type_h2 text_color_primary mt-25 mb-20 ${styles.title}`}>
        Каталог
      </h2>
      <div className={styles.box}>
        {items.map((item) => (
          <MainCard key={item.id} id={item.id} name={item.name} date={item.description} />
        ))}
      </div>

      {pagData.count > 10 && (
        <PaginationBox data={pagData} queryPage={queryPage} setQueryPage={setQueryPage} />
      )}
    </section>
  );
};
