import HomeLayout from "./layouts/HomeLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachQuestionary from "./pages/coach/CoachQuestionary";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import MemberLayout from "./layouts/MemberLayout";
import MemberHome from "./pages/member/MemberHome";
import Questionary from "./pages/member/Questionary";
import FitnessGoal from "./pages/member/FitnessGoal";
import Schedule from "./pages/member/Schedule";
import Preferences from "./pages/member/Preferences";
import Services from "./pages/home/Services";
import LandingPage from "./pages/member/LandingPage";
import Profile from "./pages/member/Profile";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="#service" element={<Services />} />
        </Route>
        {/* Auth Routes - Outside HomeLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Member Routes */}
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberHome />} />
          <Route path="questionary" element={<Questionary />} />
          <Route path="fitnessGoal" element={<FitnessGoal />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="landingPage" element={<LandingPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/coach/questionary" element={<CoachQuestionary />} />
        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path="/admin" element="AdminLayout">

        </Route> */}
      </>
    )
  );
  return <RouterProvider router={router} />;
}
export default App;
