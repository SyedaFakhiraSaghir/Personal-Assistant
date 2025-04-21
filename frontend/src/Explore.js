import React from "react";
import './Explore.css'

const Explore = () => {
  return (
    <>
      {/* Header */}
      <header className="header">
        <a href="#default" className="logo">
          RAAS
        </a>
        <div className="header-right">
          <a className="active" href="http://localhost:3000/">
            Login
          </a>
          <a className="active" href="http://localhost:3000/signup">
            Signup
          </a>
        </div>
      </header>

      {/* Features Section */}
      <main>
        <section className="features-section">
          <h2>Website Features</h2>

          <div className="feature">
            <h3>User Profile Management</h3>
            <p>
              Maintain your profile with personal details and preferences,
              ensuring a personalized and seamless experience. Update your
              settings easily to customize your interaction with the website.
            </p>
          </div>

          <div className="feature">
            <h3>Schedule Management</h3>
            <p>
              Organize your events with ease. Create, edit, and delete meetings,
              appointments, or deadlines. Stay productive with reminders and
              detailed event tracking.
            </p>
          </div>

          <div className="feature">
            <h3>Notes Management</h3>
            <p>
              Create and organize notes effortlessly. Whether it's a to-do list
              or a brilliant idea, your notes are always just a search away.
            </p>
          </div>

          <div className="feature">
            <h3>Chatbot Assistance</h3>
            <p>
              Navigate the website effortlessly with a virtual assistant that
              provides guidance, answers queries, and offers helpful
              suggestions.
            </p>
          </div>

          <div className="feature">
            <h3>Quotes Management</h3>
            <p>
              Stay motivated with a collection of inspiring quotes. Browse
              through various categories to find words that resonate with you.
            </p>
          </div>

          <div className="feature">
            <h3>Book Suggestions</h3>
            <p>
              Discover new books tailored to your preferences. From fiction to
              self-help, explore content that matches your interests.
            </p>
          </div>

          <div className="feature">
            <h3>Health and Fitness Management</h3>
            <p>
              Track your physical activities, monitor health metrics, and set
              fitness goals. Receive personalized health tips to stay motivated
              and proactive.
            </p>
          </div>

          <div className="feature">
            <h3>Personal Finance Management</h3>
            <p>
              Manage your income, expenses, and budgets effectively. Get clear
              financial insights with categorized summaries and charts.
            </p>
          </div>

          <div className="feature">
            <h3>Notifications and Reminders</h3>
            <p>
              Never miss an important event, deadline, or task. Receive timely
              reminders to keep you on track with your goals.
            </p>
          </div>

          <div className="feature">
            <h3>Recipe and Grocery Organizer</h3>
            <p>
              Save and organize your favorite recipes while planning your meals
              efficiently. Manage your grocery lists to make shopping
              hassle-free.
            </p>
          </div>

          <div className="feature">
            <h3>Mood Determination</h3>
            <p>
              Track your emotional well-being with mood icons and weekly
              history. Reflect on your mood patterns and take steps to improve.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
       <center> <p>&copy; {new Date().getFullYear()} RAAS</p></center>
      </footer>
    </>
  );
};

export default Explore;
