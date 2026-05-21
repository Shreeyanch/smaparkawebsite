import Home from "./votePages/Home";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Enter from "./votePages/Enter";
import VoteE from "./votePages/Vote";
import Thankyou from "./votePages/Thankyou";
import OTP from "./votePages/OTP";
import Result from "./votePages/Result";

const Vote = () => {
  return (
    <div className="bg-white min-h-screen">
      <Router>
        <Toaster richColors expand={false} position="top-right" />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/enter" element={<Enter />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/vote" element={<VoteE />} />
          <Route path="/thank-you" element={<Thankyou />} />
          <Route path="/result" element={<Result />} />
          {/* <Route path="/create" element={<Create />} />
        <Route path="/poll/:id" element={<Poll />} />
        <Route path="/results/:id" element={<Results />} /> */}
        </Routes>
      </Router>
    </div>
  );
};

export default Vote;
