import React, { useEffect, useState } from "react";
import Modal from "./modal/Modal";

const Problem2 = () => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <div className="container">
      <Modal />
    </div>
  );
};

export default Problem2;
