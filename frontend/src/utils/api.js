import { URL } from "./constants";

const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};
const headersWithContentType = { "Content-Type": "application/json" };

export const registerUser = (username, password) => {
  return fetch(`${URL}/api/users/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  }).then(checkResponse);
};

export const loginUser = (username, password) => {
  return fetch(`${URL}/api/token/login/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  })
    .then(checkResponse)
    .then((data) => {
      if (data.auth_token) {
        localStorage.setItem("auth_token", data.auth_token);
        return data;
      }
      return null;
    });
};

export const logoutUser = () => {
  return fetch(`${URL}/api/token/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then((res) => {
    if (res.status === 204) {
      localStorage.removeItem("auth_token");
      return res;
    }
    return null;
  });
};

export const getUser = () => {
  return fetch(`${URL}/api/users/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const getItems = (page = 1) => {
  return fetch(`${URL}/api/items/?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const getItem = (id) => {
  return fetch(`${URL}/api/items/${id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const sendItem = (card) => {
  return fetch(`${URL}/api/items/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const updateItem = (card, id) => {
  return fetch(`${URL}/api/items/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const deleteCard = (id) => {
  return fetch(`${URL}/api/items/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then((res) => {
    if (res.status === 204) {
      return { status: true };
    }
    return { status: false };
  });
};

export const createItem = async (itemData) => {
  try {
    const response = await fetch("/api/items/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Token ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error("Ошибка при создании товара");
    }

    return response.json(); // Возвращаем данные созданного товара
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (itemId, quantity) => {
  try {
    const response = await fetch("/api/order/add_item_to_order/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({ item_id: itemId, quantity }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при добавлении товара в заказ");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCurrentOrder = async () => {
  try {
    const response = await fetch("/api/order/current/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem("auth_token")}`, // Если используется токен аутентификации
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка при получении заказа");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка API:", error);
    return null;
  }
};

export const updateItemQuantity = async (itemId, quantity) => {
  try {
    const response = await fetch(`/api/order/add_item_to_order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({ item_id: itemId, quantity: quantity }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении количества товара");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeItemFromOrder = async (orderId, itemId) => {
  const response = await fetch(`/api/order/${orderId}/remove_item/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({ item_id: itemId }),
  });

  if (!response.ok) {
    throw new Error("Ошибка при удалении товара");
  }
  return response.json();
};



