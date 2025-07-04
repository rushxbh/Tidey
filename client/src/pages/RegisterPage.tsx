import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Waves, Mail, Lock, User, Building2, Eye, EyeOff } from "lucide-react";

// Glass Form Component with inline styles
const GlassForm: React.FC<{
  children: React.ReactNode;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}> = ({ children, onMouseMove, onMouseLeave }) => {
  const glassFormStyles: React.CSSProperties = {
    position: "relative",
    width: "100%",
    maxWidth: "450px",
    minHeight: "600px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
    animation: "slideInUp 0.6s ease-out",
  };

  const glassFilterStyles: React.CSSProperties = {
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    zIndex: 1,
    backdropFilter: "blur(4px)",
    filter: "saturate(120%) brightness(1.15)",
  };

  const glassOverlayStyles: React.CSSProperties = {
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.25)",
  };

  const glassSpecularStyles: React.CSSProperties = {
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    zIndex: 3,
    boxShadow: "inset 1px 1px 1px rgba(255, 255, 255, 0.75)",
  };

  const glassContentStyles: React.CSSProperties = {
    position: "relative",
    zIndex: 4,
    padding: "30px",
    color: "#ffffff",
    height: "100%",
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .glass-form h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 600;
            text-align: center;
            color: #ffffff;
          }

          .glass-form p {
            margin: 0 0 30px 0;
            text-align: center;
            opacity: 0.8;
            font-size: 14px;
            color: #ffffff;
          }

          .glass-form .form-group {
            position: relative;
            margin-bottom: 20px;
          }

          .glass-form .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            opacity: 0.9;
            color: #ffffff;
          }

          .glass-form .input-wrapper {
            position: relative;
          }

          .glass-form .icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #ffffff;
            opacity: 0.8;
            z-index: 1;
          }

          .glass-form input,
          .glass-form select {
            width: 100%;
            padding: 12px 15px 12px 45px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: #ffffff;
            font-size: 16px;
            transition: border-color 0.3s ease, background 0.3s ease;
            box-sizing: border-box;
          }

          .glass-form input:focus,
          .glass-form select:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.75);
          }

          .glass-form input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .glass-form select {
            padding-left: 15px;
          }

          .glass-form .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #ffffff;
            opacity: 0.8;
            cursor: pointer;
            z-index: 1;
            padding: 0;
          }

          .glass-form .password-toggle:hover {
            opacity: 1;
          }

          .glass-form .submit-btn {
            width: 100%;
            padding: 14px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
          }

          .glass-form .submit-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }

          .glass-form .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .glass-form .form-switch {
            text-align: center;
            margin-top: 25px;
            font-size: 14px;
            opacity: 0.8;
            color: #ffffff;
          }

          .glass-form .form-switch a {
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            opacity: 1;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .glass-form .form-switch a:hover {
            text-decoration: underline;
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          }

          .glass-form .error-message {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 20px;
            color: #fecaca;
            font-size: 14px;
            animation: shake 0.5s ease-in-out;
          }

          .glass-form .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
      <div
        className="glass-form"
        style={glassFormStyles}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <svg style={{ display: "none" }}>
          <filter id="glass-distortion">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.008"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
          </filter>
        </svg>

        <div className="glass-filter" style={glassFilterStyles}></div>
        <div className="glass-overlay" style={glassOverlayStyles}></div>
        <div className="glass-specular" style={glassSpecularStyles}></div>
        <div className="glass-content" style={glassContentStyles}>
          {children}
        </div>
      </div>
    </>
  );
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer" as "volunteer" | "ngo",
    organizationName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath =
        user.role === "volunteer" ? "/volunteer/dashboard" : "/ngo/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      // The useEffect above will handle the redirect once user is set
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const specular = e.currentTarget.querySelector(
      ".glass-specular"
    ) as HTMLElement;
    if (specular) {
      specular.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255,255,255,0.15) 0%,
        rgba(255,255,255,0.05) 30%,
        rgba(255,255,255,0) 60%
      )`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const specular = e.currentTarget.querySelector(
      ".glass-specular"
    ) as HTMLElement;
    if (specular) {
      specular.style.background = "none";
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ocean Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-800/60 to-teal-700/70"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Animated waves */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-30">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
            fill="rgba(255,255,255,0.1)"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z;
                      M0,80 C300,40 600,100 900,80 C1050,60 1150,100 1200,80 L1200,120 L0,120 Z;
                      M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
            />
          </path>
        </svg>
      </div>

      <GlassForm onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="logo-container">
          <Waves size={48} />
        </div>
        <h1>Join Tidey</h1>
        <p>Create your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO/Organization</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              {formData.role === "volunteer" ? "Full Name" : "Contact Name"}
            </label>
            <div className="input-wrapper">
              <User className="icon" size={20} />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          {formData.role === "ngo" && (
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <div className="input-wrapper">
                <Building2 className="icon" size={20} />
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="icon" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="icon" size={20} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="icon" size={20} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="form-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </GlassForm>
    </div>
  );
};

export default RegisterPage;
