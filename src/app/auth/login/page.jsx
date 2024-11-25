"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import Link from "next/link";
import { useUser } from "@apply/app/store/useStore";
export default function LogIn() {
  const { user, setUser } = useUser(); // Destructure user as well
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

 // Insert the user email into the users table
        const { error: insertError } = await supabase
          .from("users")
          .upsert([{
            email: session.user.email,
            profile: {
              username: session.user.user_metadata?.full_name ?? "",
              profile_pic: session.user.user_metadata?.avatar_url ?? "",
              phone: session.user.user_metadata?.phone ?? "",
            }
          }], 
          { onConflict: ['email'] });
          console.log('User Metadata:', session.user.user_metadata);
        if (insertError) {
          console.error("Error upserting user email into users table:", insertError);
        }


      if (error) {
        throw new Error(error.message);
      }
      setUser(email); // Update the user
      setSnackbarMessage("Check your email for the login link!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(error.message,'Try with google');
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  // Redirect after user state is set
  useEffect(() => {
    if (user) {
      router.push("/pages/mainpage");
    }
  }, [user, router]);

  const handleGoogleSignUp = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });

      if (error) {
        throw new Error(error.message);
      }

      setSnackbarMessage("Please Wait...");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">SignIn</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "SignIn"}
          </button>
        </form>
        <div className="mt-6">
          <button
            onClick={handleGoogleSignUp}
            className="w-full text-slate-800 border border-red-500 py-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center hover:text-white"
            disabled={loading}
          >
            <Image src="/google.svg" alt="Google Logo" className="w-5 h-5 mr-2" width={20} height={20} />
            Continue with Google
          </button>
        </div>
      </div>
      <small>
        <Link
          href="/auth/signin"
          className="my-10 text-blue-900 hover:text-blue-600 hover:cursor-pointer hover:underline"
        >
          SignUp
        </Link>
      </small>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
