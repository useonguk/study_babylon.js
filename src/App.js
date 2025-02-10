import "./reset.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThreeDUI from "./useIt";

const App = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>메인이에요</div>} />
          <Route path="/ui" element={<ThreeDUI />} />
          <Route path="*" element={<div>없는것이와요</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
