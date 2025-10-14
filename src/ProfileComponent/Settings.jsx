import { PrimaryButton } from "../buttons";
import { supabase } from "../supabaseClient"; // adjust the import path to your supabase client file
import { useNavigate } from "react-router-dom";

export default function SettingsSection() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      // Optionally show error to user
    } else {
      // Redirect to login or home page after logout
      navigate("/"); // change path if you want
    }
  };

  return (
    <div className="px-10 py-5">
      <PrimaryButton name="LogOut" onClick={handleLogout} />;
    </div>
  );
}
