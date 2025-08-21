import { useCallback } from "react";
import Header from "../components/header";
import ShareYourTravelsForm from "../components/share-your-travels-form";
import Footer from "../components/footer";
import styles from "./get-in-touch.module.css";

const GetInTouch = () => {
  const onHomeTextClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='heroSection']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  return (
    <div className={styles.getintouch}>
      <Header onHomeTextClick={onHomeTextClick} />
      <ShareYourTravelsForm />
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" propGap="24px" />
    </div>
  );
};

export default GetInTouch;
