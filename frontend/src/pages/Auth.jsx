import React, { useEffect, useState } from "react";
import { Key, Mail, User } from "react-feather";
import { supabase } from "../services/supabase/client";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { White100Button } from "../components/ui/buttons";

function BaseInput({ Icon, Label, ...props }) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[11px] text-white-300 uppercase tracking-widest font-bold pl-1">
        {Label}
      </label>
      <div
        className="flex items-center w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 
                      focus-within:bg-black-300 focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/10 transition-all duration-300"
      >
        {Icon && (
          <Icon size={16} className="text-white-300 mr-3 flex-shrink-0" />
        )}
        <input
          {...props}
          placeholder={`Enter your ${Label.toLowerCase()}...`}
          className="w-full bg-transparent text-sm text-white-100 placeholder-white-300/40 outline-none border-none"
        />
      </div>
    </div>
  );
}

export default function Auth() {
  const [signIn, setSignin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full bg-black-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-black-100 to-black-100">
      <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300">
        {signIn ? (
          <SignIn setSignin={setSignin} />
        ) : (
          <SignUp setSignin={setSignin} />
        )}
      </div>
    </div>
  );
}

function SignIn({ setSignin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
    } else {
      toast.success("Signed in successfully!");
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white-100">
          Welcome Back
        </h2>
        <p className="text-xs text-white-300">
          Let’s pick up where you left off tracking.
        </p>
      </div>

      <div className="space-y-4">
        <BaseInput
          Icon={Mail}
          Label="Email Address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <BaseInput
          Icon={Key}
          Label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <White100Button
        type="submit"
        name={loading ? "Authenticating Account..." : "Continue to Feed"}
        disabled={loading}
      />

      <p className="text-center text-xs text-white-300 font-medium">
        New to TasteFlicks?{" "}
        <span
          onClick={() => setSignin(false)}
          className="text-purple-400 font-bold cursor-pointer hover:underline transition"
        >
          Create an Account
        </span>
      </p>
    </form>
  );
}

function SignUp({ setSignin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e) {
    e.preventDefault();

    if (!email || !password || !username) {
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });
    setLoading(false);

    if (error) {
      toast.error(`Sign up failed: ${error.message}`);
    } else {
      toast.success("Signup successful! Check your email to confirm.");
      setSignin(true);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white-100">
          Get Started
        </h2>
        <p className="text-xs text-white-300">
          Let’s start building your movie world portfolio.
        </p>
      </div>

      <div className="space-y-3.5">
        <BaseInput
          Icon={User}
          Label="Username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <BaseInput
          Icon={Mail}
          Label="Email Address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <BaseInput
          Icon={Key}
          Label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <BaseInput
          Icon={Key}
          Label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="pt-2">
        <White100Button
          type="submit"
          name={loading ? "Registering Credentials..." : "Create Account"}
          disabled={loading}
        />
      </div>

      <p className="text-center text-xs text-white-300 font-medium">
        Already tracking with us?{" "}
        <span
          onClick={() => setSignin(true)}
          className="text-purple-400 font-bold cursor-pointer hover:underline transition"
        >
          Sign In Here
        </span>
      </p>
    </form>
  );
}
