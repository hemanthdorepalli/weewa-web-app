import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate, useLocation } from "react-router-dom";
import emailIcon from '../assets/icons/email-icon.png';
import whatsappIcon from '../assets/icons/Whatsapp-icon.png';
import ontropiIcon from '../assets/icons/Zapp-icon.png';
import axiosInstance from '../utils/axios-config';

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentText, setCurrentText] = useState("Weather");
  const [isSignup, setIsSignup] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [identifier, setIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    const words = ["Weather", "Energy", "Environment", "Water", "Atmosphere", "WEEWA"];
    let index = 0;

    const intervalId = setInterval(() => {
      if (index < words.length) {
        setCurrentText(words[index]);
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTP = [...otp];
      newOTP[index] = value;
      setOTP(newOTP);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      else if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleKeySelection = async (method) => {
    if (!identifier) {
      setError("Please enter email or phone number first");
      return;
    }

    setError(""); 
    
    try {
      const type = identifier.includes('@') ? 'email' : 'phone';
      
      const response = await axiosInstance.post('/send-otp/', {
        identifier: identifier.trim(),
        type: method 
      });

      if (response.data.status === 'success') {
        setOtpSent(true);
        setShowOTP(true);
        alert(`OTP sent via ${method} to ${identifier}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to send OTP via ${method}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        const response = await axiosInstance.post('/register/', {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          password: password
        });

        if (response.data.status === 'success') {
          setIsSignup(false);
          setError(""); 
          alert("Registration successful! Please login.");
        }
      } else {
        const response = await axiosInstance.post('/login/', {
          identifier: identifier,
          otp: otp.join(''),
          password: password
        });

        if (response.data.status === 'success') {
          localStorage.setItem('accessToken', response.data.tokens.access);
          localStorage.setItem('user', JSON.stringify({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            city: response.data.city,
            isAdmin: response.data.is_admin,
            avatar: response.data.profile,
            isLoggedIn: true
          }));

          axiosInstance.defaults.headers.common['Authorization'] = 
            `Bearer ${response.data.tokens.access}`;

          navigate('/weather', { replace: true });
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="login-container">
      <div className="left-column"></div>
      <div className="right-column">
        <div className="login-box">
          <h2 className="title">
            {currentText === "WEEWA" ? (
              <span className="bouncing-letters">
                {currentText.split("").map((letter, index) => (
                  <span key={index} className={`letter letter-${index + 1}`}>
                    {letter}
                  </span>
                ))}
              </span>
            ) : (
              currentText
            )}
          </h2>
          
          {error && <div className="error-message" role="alert">{error}</div>}
          
          {isSignup ? (
            <div className="form-container">
              <form onSubmit={handleSubmit} noValidate>
                <div className="login-form-content">
                  <div className="form-group compact">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="form-group compact">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Sign Up
                  </button>
                </div>
              </form>
              <div className="register-link">
                <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); }}>Login here</a></span>
              </div>
            </div>
          ) : (
            <div className="form-container">
              <form onSubmit={handleSubmit} noValidate>
                <div className="login-form-content">
                  <div className="form-group compact">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError(""); 
                      }}
                      placeholder="Email or Mobile Number"
                      required
                    />
                  </div>

                  <div className="key-section compact">
                    <span className="key-label">Get key from:</span>
                    <div className="key-options">
                      <img 
                        src={emailIcon} 
                        alt="Email" 
                        onClick={() => handleKeySelection('email')}
                        style={{ cursor: 'pointer' }}
                        title="Get OTP via Email"
                      />
                      <img 
                        src={whatsappIcon} 
                        alt="WhatsApp" 
                        onClick={() => handleKeySelection('whatsapp')}
                        style={{ cursor: 'pointer' }}
                        title="Get OTP via WhatsApp"
                      />
                      <img 
                        src={ontropiIcon} 
                        alt="Zapp" 
                        onClick={() => handleKeySelection('zapp')}
                        style={{ cursor: 'pointer' }}
                        title="Get OTP via Zapp"
                      />
                    </div>
                  </div>

                  {showOTP && (
                    <div className="otp-section">
                      <div className="otp-inputs">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                            className="otp-input"
                            placeholder=""
                          />
                        ))}
                      </div>
                      {otpSent && (
                        <div className="resend-otp">
                          <button 
                            type="button" 
                            onClick={() => handleKeySelection(identifier.includes('@') ? 'email' : 'whatsapp')}
                            className="resend-btn"
                          >
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="or-separator">(OR)</div>

                  <div className="form-group compact">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Log in
                  </button>
                </div>
              </form>
              <div className="register-link">
                <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); }}>Register here</a></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;