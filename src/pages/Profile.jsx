import { useSelector } from "react-redux";
import { Bookmark, Film, Layers, Tv } from "react-feather";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Black200Button, PrimaryButton } from "../buttons";
import MoviesSection from "../ProfileComponent/MoviesSection";
import TVShowsSection from "../ProfileComponent/TVShowsSection";
import OverviewSection from "../ProfileComponent/OverviewSection";
import Watchlist from "../ProfileComponent/Watchlist";

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error.message);
};

export default function Profile() {
  const user = useSelector((state) => state.user.user);
  const [profileSection, setProfileSection] = useState("Overview");

  const renderButton = (name, Icon) => {
    const ButtonComponent =
      profileSection === name ? PrimaryButton : Black200Button;
    return (
      <ButtonComponent
        key={name}
        name={name}
        icon={Icon}
        onClick={() => setProfileSection(name)}
      />
    );
  };

  if (!user) return null;

  return (
    <div>
      <section className="p-6 md:p-10 bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 flex flex-col gap-8">
        <h1 className="text-4xl sm:text-5xl font-semibold text-white-100 text-start">
          Hi, <span className="text-primary-100">{user.display_name}</span>
        </h1>

        <div className="flex flex-wrap gap-3 md:gap-5 justify-start">
          {renderButton("Overview", Layers)}
          {renderButton("Movies", Film)}
          {renderButton("TV Shows", Tv)}
          {renderButton("Watchlist", Bookmark)}
          <PrimaryButton name="Sign Out" onClick={handleSignOut} />
        </div>
      </section>

      <main>
        {profileSection === "Overview" && <OverviewSection />}
        {profileSection === "Watchlist" && <Watchlist />}
        {profileSection === "Movies" && <MoviesSection />}
        {profileSection === "TV Shows" && <TVShowsSection />}
      </main>
    </div>
  );
}
