import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { UserContext } from "../../utils/context";
import { getUser } from "../../utils/api";

import { ProtectedRoute } from "../ui/protected-roure/protected-route";

import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SignUp } from "../sign-up/sign-up";
import { SignIn } from "../sign-in/sign-in";
import { MainPage } from "../main-page/main-page";
import { ItemPage } from "../card-page/card-page";
import { AddItemPage } from "../add-let/main-card";
import { SuccessPage } from "../success-page/success-page";
import { CancelPage } from "../cancel-page/cansel-page";
import { OrderPage } from "../order-page/order-page";
// import { AddCardPage } from "../add-card-page/add-card-page";
// import { EditCardPage } from "../edit-card-page/edit-card-page";
// import { AddItemPage } from "../add-let/main-card";
// import { AddPostcardPage } from "../pages/AddPostcardPage";
// import { AddVideoPage } from "../pages/AddVideoPage";
// import { AddAudioPage } from "../pages/AddAudioPage";

import styles from "./app.module.css";

function App() {
  const [userState, setUserState] = React.useState({});
  const [currentCard, setCurrentCard] = React.useState({});
  const [queryPage, setQueryPage] = React.useState(1);

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      getUser().then((res) => {
        if (res && res.id) {
          setUserState({ id: res.id });
        }
      });
    }
  }, []);

  return (
    <div className={styles.app}>
      <UserContext.Provider value={[userState, setUserState]}>
        <BrowserRouter>
          <Header setQueryPage={setQueryPage} />
          <main className={styles.content}>
            <Switch>
              <ProtectedRoute exact path="/">
                <MainPage queryPage={queryPage} setQueryPage={setQueryPage} />
              </ProtectedRoute>
              <Route path="/signin">
                <SignIn />
              </Route>
              <Route path="/signup">
                <SignUp />
              </Route>
              <ProtectedRoute path="/success">
                <SuccessPage />
              </ProtectedRoute>
              <ProtectedRoute path="/cancel">
                <CancelPage />
              </ProtectedRoute>
              <ProtectedRoute path="/order">
                <OrderPage />
              </ProtectedRoute>
              <ProtectedRoute path="/items/add">
                <AddItemPage />
              </ProtectedRoute>
              <ProtectedRoute path="/items/:id">
                <ItemPage data={currentCard} setData={setCurrentCard} />
              </ProtectedRoute>
              <ProtectedRoute path="/order/:id">
                <OrderPage data={currentCard} setData={setCurrentCard} />
              </ProtectedRoute>
              {/* <ProtectedRoute path="/cats/add">
                <AddCardPage />
              </ProtectedRoute>
              <ProtectedRoute path="/cats/edit">
                <EditCardPage data={currentCard} setData={setCurrentCard} />
              </ProtectedRoute> */}
              
              {/* <ProtectedRoute path="/cats/:id">
                <CardPage data={} setData={setCurrentCard} />
              </ProtectedRoute> */}
              {/* <ProtectedRoute path="/postcards/add">
                <AddPostcardPage />
              </ProtectedRoute>
              <ProtectedRoute path="/videos/add">
                <AddVideoPage />
              </ProtectedRoute>
              <ProtectedRoute path="/audios/add">
                <AddAudioPage />
              </ProtectedRoute> */}
            </Switch>
          </main>
          <Footer />
        </BrowserRouter>
      </UserContext.Provider>
    </div>
  );
}

export default App;
