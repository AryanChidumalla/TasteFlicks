import { Key, Mail, User } from "react-feather";
import { White100Button } from "../buttons";
import { use, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function BaseInput({ Icon, Label, ...props }) {
  return (
    <div
      className="flex items-center w-full border border-white-300 rounded px-2 py-1 
                    focus-within:border-white-200 transition duration-200"
    >
      {Icon && <Icon size={20} className="text-white-300 mr-3 min-w-[20px]" />}
      <input
        {...props}
        placeholder={Label}
        className="w-full bg-transparent text-white-100 placeholder-white-300 outline-none border-none"
      />
    </div>
  );
}

export default function Auth() {
  const [signIn, setSignin] = useState(true);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return signIn ? (
    <SignIn signIn={signIn} setSignin={setSignin} />
  ) : (
    <SignUp signIn={signIn} setSignin={setSignin} />
  );
}

function SignIn({ setSignin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    console.log("supabase object:", supabase);
    console.log("supabase.auth:", supabase.auth);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // console.log("signInWithPassword:", supabase.auth.signInWithPassword);

    setLoading(false);

    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
    } else {
      toast.success("Signed in successfully!");
      // You can redirect or update auth state here if needed
    }
  };

  return (
    <div className="bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 absolute top-0 left-0 h-full w-full flex justify-center items-center">
      <div className="w-[500px] px-20 py-10 rounded bg-black-100 border border-black-300 text-white-100 flex flex-col gap-5">
        <div className="flex flex-col text-center">
          <div className="font-semibold text-xl">Welcome Back</div>
          <div className="font-regular text-l">
            Let’s pick up where you left off.
          </div>
        </div>

        <BaseInput
          Icon={Mail}
          Label="Email Address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <BaseInput
          Icon={Key}
          Label="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <White100Button
          name={loading ? "Signing in..." : "Continue"}
          onClick={handleSignIn}
          disabled={loading}
        />

        <div className="flex items-center justify-center font-regular text-sm text-white-100">
          New here?
          <span
            onClick={() => setSignin(false)}
            className="text-primary-100 cursor-pointer px-1"
          >
            Sign Up
          </span>
          now.
        </div>
      </div>
    </div>
  );
}

function SignUp({ setSignin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !username) {
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(`Sign up failed: ${error.message}`);
    } else {
      toast.success("Signup successful! Check your email to confirm.");
      setSignin(true); // move to sign-in screen
    }
  }

  return (
    <div className="bg-gradient-to-r from-black-100 via-[#1F1A4D] to-primary-300 absolute top-0 left-0 h-full w-full flex justify-center items-center">
      <div className="w-[500px] px-20 py-10 rounded bg-black-100 border border-black-300 text-white-100 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="font-semibold text-xl">Welcome!</h2>
          <p className="font-regular text-l">
            Let’s start building your movie world.
          </p>
        </div>

        <BaseInput
          Icon={User}
          Label="Username"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
        />
        <BaseInput
          Icon={Mail}
          Label="Email Address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <BaseInput
          Icon={Key}
          Label="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <BaseInput
          Icon={Key}
          Label="Confirm Password"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <White100Button
          name={loading ? "Loading..." : "Continue"}
          onClick={handleSignUp}
          disabled={loading}
        />

        <div className="flex items-center justify-center font-regular text-sm text-white-100">
          Got an account?
          <span
            onClick={() => setSignin(true)}
            className="text-primary-100 cursor-pointer px-1"
          >
            Sign In
          </span>
          and start watching.
        </div>
      </div>
    </div>
  );
}
