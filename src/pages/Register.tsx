import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Register = () => {
  const { user, loading, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        const friendly: Record<string, string> = {
          'User already registered': 'An account with that email already exists.',
          'Email not confirmed': 'Please verify your email before signing in.',
        };
        setError(friendly[error.message] ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    fontFamily: "'Lato', sans-serif",
    fontSize: "0.875rem",
    borderColor: "#EDE8DC",
    color: "#1A1209",
  };

  const EyeOpen = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeClosed = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative"
      style={{ backgroundColor: "#FDFAF5" }}
    >
      <Link
        to="/"
        className="absolute top-4 left-6 font-sans text-xs uppercase tracking-widest transition-colors duration-200"
        style={{ color: "#7A6E62" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#7A6E62")}
      >
        ← Back to Home
      </Link>

      <div className="text-center max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-12">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M5 0V14M0 4.5H10" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "1.25rem",
              letterSpacing: "0.05em",
              color: "#C9A84C",
            }}
          >
            CrossAlliance
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "2.25rem",
            color: "#1A1209",
            marginBottom: "0.75rem",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "1rem",
            color: "#7A6E62",
            marginBottom: "2.5rem",
          }}
        >
          Join the CrossAlliance community today.
        </p>

        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 mx-auto border shadow-sm transition-colors duration-200 hover:border-[#C9A84C] w-full justify-center"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "0.875rem",
            color: "#1A1209",
            backgroundColor: "#FFFFFF",
            borderColor: "#EDE8DC",
            padding: "1rem 2rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8DC" }} />
          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.75rem", color: "#7A6E62" }}>
            or continue with
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8DC" }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C]"
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C]"
            style={inputStyle}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 pr-12 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C]"
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle password visibility">
              {showPassword ? EyeClosed : EyeOpen}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-3 pr-12 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C]"
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle confirm password visibility">
              {showConfirm ? EyeClosed : EyeOpen}
            </button>
          </div>

          {error && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.75rem", color: "#EA4335" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg transition-colors duration-200 disabled:opacity-60"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              backgroundColor: "#C9A84C",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#b8973f"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; }}
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6" style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.875rem", color: "#7A6E62" }}>
          Already have an account?{" "}
          <Link to="/login" className="underline transition-colors duration-200" style={{ color: "#C9A84C" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
