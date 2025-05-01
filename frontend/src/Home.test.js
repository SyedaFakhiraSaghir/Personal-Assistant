import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Home Component", () => {
  beforeEach(() => {
    localStorage.setItem("userId", "testUser");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders RAAS header and feature cards", () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    
    expect(screen.getByText(/RAAS/i)).toBeInTheDocument();
    expect(screen.getByText(/Mood Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Finance Tracker/i)).toBeInTheDocument();
  });

  test("redirects to login if no userId", () => {
    localStorage.removeItem("userId");
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to Profile on click", () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Profile/i));
    expect(mockNavigate).toHaveBeenCalledWith("/Profile");
  });

  test("logout clears userId and navigates to login", () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Logout/i));
    expect(localStorage.getItem("userId")).toBe(null);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
