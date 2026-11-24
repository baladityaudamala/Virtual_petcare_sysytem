
import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "../Context/UserContext";
import ThemeContext from "../Context/ThemeContext";
import Notify from "./Modals/Notify";
import PetContext from "../Context/PetContext";
import { Modal } from "react-bootstrap";
import HandleAppoint from "./Helpers/HandleAppoint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://127.0.0.1:5000");

const NavBar = () => {
    const { userData, setUserData } = useContext(UserContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const [links, setLinks] = useState(null);
    const { appt, setAppt, pets, setPets, setPetId, setNewPetData } =
        useContext(PetContext);

    const [show, setShow] = useState(false);
    const [vals, setVals] = useState([]);
    const [about, showAbout] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const logout = () => {
        setUserData({ token: undefined, user: undefined });
        setPetId(null);
        setPets([]);
        setAppt(0);
        setNewPetData("pet babies");

        localStorage.setItem("auth-token", "");
        localStorage.removeItem("petId");
    };

    const linkStyle = {
        textDecoration: "none",
        color: "black",
    };

    const handleClose = () => {
        setShow(false);
    };

    const closeAbout = () => {
        showAbout(false);
    };

    const openAbout = () => {
        showAbout(true);
    };

    // Socket.IO connection and unread message notifications
    useEffect(() => {
        if (!userData.user) {
            setUnreadCount(0);
            return;
        }

        const newSocket = io(API_URL);

        newSocket.emit("setup", userData.user);

        newSocket.on("notification", () => {
            setUnreadCount((prev) => prev + 1);
        });

        const fetchUnread = async () => {
            try {
                const res = await axios.get("/chats", {
                    headers: {
                        "x-auth-token": localStorage.getItem("auth-token"),
                    },
                });

                let count = 0;

                res.data.forEach((chat) => {
                    if (chat.unreadCounts) {
                        const myId =
                            userData.user.id || userData.user._id;

                        count += chat.unreadCounts[myId] || 0;
                    }
                });

                setUnreadCount(count);
            } catch (err) {
                console.log("Error fetching unread messages:", err);
            }
        };

        fetchUnread();

        return () => {
            newSocket.disconnect();
        };
    }, [userData.user]);

    // Navigation links
    useEffect(() => {
        if (!userData.user) {
            setLinks(
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/" style={linkStyle}>
                            Home
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link className="nav-link" to="/login" style={linkStyle}>
                            Login
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link className="nav-link" to="/register" style={linkStyle}>
                            Register
                        </Link>
                    </li>
                </ul>
            );
        } else {
            setLinks(
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/" style={linkStyle}>
                            Home
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link className="nav-link" to="/community" style={linkStyle}>
                            Community
                        </Link>
                    </li>

                    <li className="nav-item position-relative">
                        <Link
                            className="nav-link"
                            to="/chat"
                            style={linkStyle}
                            onClick={() => setUnreadCount(0)}
                        >
                            Chat
                            {unreadCount > 0 && (
                                <span
                                    className="position-absolute top-10 start-90 translate-middle badge rounded-pill bg-danger"
                                    style={{
                                        fontSize: "0.6rem",
                                        marginLeft: "5px",
                                    }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            className="nav-link"
                            to={`/profile/${userData.user._id}`}
                            style={linkStyle}
                        >
                            Profile
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to=".."
                            className="nav-link"
                            style={linkStyle}
                            onClick={openAbout}
                        >
                            About
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link className="nav-link" to="/analytics" style={linkStyle}>
                            Health Analytics
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link className="nav-link" to="/nearby" style={linkStyle}>
                            Find Services
                        </Link>
                    </li>

                    <li className="nav-item">
                        <button
                            className="btn nav-link"
                            onClick={toggleTheme}
                            style={linkStyle}
                        >
                            {theme === "light" ? (
                                <i className="bi bi-moon-fill"></i>
                            ) : (
                                <i className="bi bi-sun-fill"></i>
                            )}
                        </button>
                    </li>

                    {appt > 0 && (
                        <li className="nav-item">
                            <Link
                                to=".."
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShow(true);
                                }}
                            >
                                <i className="bi bi-bell-fill position-relative">
                                    <span className="nav-notification-badge">
                                        {appt}
                                    </span>
                                </i>
                            </Link>
                        </li>
                    )}

                    <li className="nav-item">
                        <Link
                            className="nav-link"
                            to="/"
                            style={linkStyle}
                            onClick={logout}
                        >
                            Log Out
                        </Link>
                    </li>
                </ul>
            );

            setAppt(HandleAppoint(pets, "nav"));

            if (appt) {
                setVals(HandleAppoint(pets, "notify"));
            } else {
                setVals([]);
            }
        }
    }, [userData, appt, pets, unreadCount, theme]);

    return (
        <>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <h3 className="navbar-brand">Fluffy</h3>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <FontAwesomeIcon
                            icon={faBars}
                            style={{ color: "#747d8c" }}
                        />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        {links}

                        <Modal name="test" show={show} onHide={handleClose}>
                            <div className="ms-auto">
                                <button
                                    style={{
                                        marginRight: "10px",
                                        marginTop: "10px",
                                        marginBottom: "0",
                                    }}
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={handleClose}
                                ></button>
                            </div>

                            <Modal.Body>
                                <Notify vals={vals} />
                            </Modal.Body>
                        </Modal>

                        <Modal name="about" show={about} onHide={closeAbout}>
                            <Modal.Body>
                                <div className="card text-center border-0">
                                    <div className="ms-auto">
                                        <button
                                            type="button"
                                            className="btn-close"
                                            aria-label="Close"
                                            onClick={closeAbout}
                                        ></button>
                                    </div>

                                    <h5 className="card-title">The Fluffy App</h5>

                                    <div className="card-body">
                                        <img
                                            src="../images/paw_logo.PNG"
                                            alt="petLogo"
                                            className="p-3 img-fluid rounded-circle w-10"
                                        />

                                        <p className="card-text">
                                            We built this platform to make pet care simple,
                                            organized, and stress-free. Our goal is to help
                                            pet parents manage daily routines, track health
                                            needs, and stay connected with a loving pet
                                            community. From reminders and vet visits to
                                            sharing special moments and chatting with
                                            fellow pet lovers, everything you need to care
                                            for your pet is in one place.
                                        </p>
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
