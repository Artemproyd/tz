import React, { useEffect, useState } from "react";
import { getCurrentOrder, updateItemQuantity, removeItemFromOrder } from "../../utils/api"; // Импортируем API

export const OrderPage = () => {
  const [order, setOrder] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getCurrentOrder();
      if (data) {
        const updatedItems = data.items.map(item => ({
          ...item,
          quantity: item.quantity || 1, // Если quantity пустое или 0, ставим 1
        }));

        setOrder({ ...data, items: updatedItems });

        const initialTotalPrice = updatedItems.reduce(
          (acc, item) => acc + item.item_price * item.quantity,
          0
        );
        setTotalPrice(initialTotalPrice);
      }
    };

    fetchOrder();
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedItems = order.items.map(item => {
      if (item.id === itemId) {
        item.quantity = newQuantity;
      }
      return item;
    });

    setOrder(prevOrder => {
      const newTotalPrice = updatedItems.reduce(
        (acc, item) => acc + item.item_price * item.quantity,
        0
      );
      setTotalPrice(newTotalPrice);
      return { ...prevOrder, items: updatedItems };
    });

    updateItemQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    try {
      // 1. Отправляем на сервер актуальное количество товаров
      const updateResponse = await fetch(`/api/order/${order.id}/update_order_items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          items: order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });
  
      if (!updateResponse.ok) {
        console.error("Ошибка обновления заказа перед оплатой");
        return;
      }
  
      // 2. Создаём сессию оплаты
      const response = await fetch(`/api/order/${order.id}/create_checkout_session/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("auth_token")}`,
         },
      });
  
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Ошибка создания сессии оплаты:", data);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    // Удаляем товар из состояния
    const updatedItems = order.items.filter(item => item.id !== itemId);
    setOrder(prevOrder => {
      const newTotalPrice = updatedItems.reduce(
        (acc, item) => acc + item.item_price * item.quantity,
        0
      );
      setTotalPrice(newTotalPrice);
      return { ...prevOrder, items: updatedItems };
    });

    try {
      // Отправляем запрос на удаление товара с сервера
      await removeItemFromOrder(order.id, itemId);
    } catch (error) {
      console.error("Ошибка при удалении товара:", error);
    }
  };

  if (!order) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>Ваш заказ</h1>
      {order.items.length === 0 ? (
        <p>Корзина пуста.</p>
      ) : (
        <ul>
          {order.items.map((item) => (
            <li key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item.item_name}</span>
              <span>
                <input
                  type="number"
                  value={item.quantity || 1}
                  min="0"
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  style={{ width: "60px" }}
                />
              </span>
              <span>{item.item_price * item.quantity} ₽</span>
              <button onClick={() => handleRemoveItem(item.id)}>Удалить</button>
            </li>
          ))}
        </ul>
      )}
      <h2>Общая стоимость: {totalPrice} ₽</h2>
      <button onClick={handleCheckout}>Оплатить</button>
    </div>
  );
};