import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (form.newPassword !== form.confirmPassword) {
                toast.error("Passwords do not match");
                setLoading(false);
                return;
            }

            await axios.post("/users/reset-password", {
                token,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword
            });

            toast.success("Password reset successful! Please login.");
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.msg || "Failed to reset password. Link may be expired.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side: Visual */}
            <div className="auth-visual-side">
                <div className="brand-content">
                    <FaPaw className="brand-logo-icon" />
                    <h1 className="brand-title">Fluffy</h1>
                    <p className="brand-tagline">Securely Reset Your Password.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="auth-form-side">
                <div className="auth-card-flat">
                    <div className="auth-header-flat">
                        <h2 className="auth-title">Set New Password</h2>
                        <p className="auth-subtitle">Please create a strong password.</p>
                    </div>

                    <form onSubmit={submit} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">New Password</label>
                            <div className="password-wrapper">
                                <input
                                    onChange={onChange}
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    className="auth-input"
                                    value={form.newPassword}
                                    required
                                    minLength="8"
                                    placeholder="Min 8 characters"
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Confirm New Password</label>
                            <div className="password-wrapper">
                                <input
                                    onChange={onChange}
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    className="auth-input"
                                    value={form.confirmPassword}
                                    required
                                    minLength="8"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
                        </div>

                        <div className="d-grid mt-4 gap-3">
                            <button disabled={loading} type="submit" className="auth-btn">
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                            <a href="/login" className="btn btn-link text-decoration-none text-muted" style={{ fontWeight: 600, textAlign: 'center' }}>Back to Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
