import React from 'react';
import ChatBot from 'react-chatbotify';

const Chatbot = () => {
  const flow = {
    start: {
      message: (
        <div style={{textAlign: 'left', padding: '10px'}}>
          <h3 style={{marginBottom: '5px', textAlign: 'center', color: '#3b82f6'}}>RAAS</h3>
          <p style={{marginTop: 0, fontSize: '14px', textAlign: 'center'}}>Your one-stop personal management website</p>
          <hr style={{borderColor: '#e5e7eb', margin: '10px 0'}}/>
          <div style={{marginBottom: '10px'}}>
            <p><strong>• Mood Tracker</strong></p>
            <p><strong>• Finance Tracker</strong></p>
            <p><strong>• Health Tracker</strong></p>
            <p><strong>• Book and Quote Suggestions</strong></p>
            <p><strong>• Notes and Schedule</strong></p>
            <p><strong>• Recipe Grocery</strong></p>
          </div>
          <hr style={{borderColor: '#e5e7eb', margin: '10px 0'}}/>
          <p style={{fontSize: '12px', fontStyle: 'italic'}}>Sit tight! I'll send you right there!</p>
          <p style={{fontSize: '12px', marginBottom: '0'}}>Do you need any other help?</p>
        </div>
      ),
      options: [
        { label: "Quickstart", value: "quickstart" },
        { label: "API Docs", value: "api_docs" },
        { label: "Examples", value: "examples" },
        { label: "Github", value: "github" },
        { label: "Discord", value: "discord" }
      ]
    },
    quickstart: {
      message: "Let's get you started! Which feature would you like to explore first?",
      options: [
        { label: "Mood Tracker", value: "mood_tracker", trigger: "navigate_mood" },
        { label: "Finance Tracker", value: "finance_tracker", trigger: "navigate_finance" },
        { label: "Health Tracker", value: "health_tracker", trigger: "navigate_health" },
        { label: "Back to Main Menu", value: "start" }
      ]
    },
    navigate_mood: {
      message: "Taking you to Mood Tracker...",
      function: () => { window.location.href = "/mood-tracker"; },
      end: true
    },
    // Add other navigation flows similarly
    github: {
      message: "Check out our GitHub repository:",
      function: () => { window.open("https://github.com/raas-project", "_blank"); },
      end: true
    },
    discord: {
      message: "Join our Discord community managed by Tan Jin:",
      function: () => { window.open("https://discord.gg/raas", "_blank"); },
      end: true
    }
  };

  const options = {
    flow,
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#ffffff',
      header: {
        title: "RAAS Assistant",
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        show: true,
        closeButton: { show: true }
      },
      chatButton: {
        icon: '💬',
        backgroundColor: '#3b82f6'
      },
      message: {
        showDate: false,
        bot: {
          backgroundColor: '#f3f4f6',
          textColor: '#111827',
          borderRadius: '10px'
        },
        user: {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          borderRadius: '10px'
        }
      },
      footer: {
        text: "Powered by React ChatBotify",
        textColor: '#6b7280',
        backgroundColor: '#f9fafb'
      },
      responsive: {
        breakpoint: 768,
        chatWindow: {
          width: '100%',
          height: '70vh'
        }
      }
    }
  };

  return <ChatBot options={options} />;
};

export default Chatbot;