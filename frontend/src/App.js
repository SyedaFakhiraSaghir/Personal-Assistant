import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Profile from './Profile';
import Explore from './Explore';
import MoodForm from './MoodForm';
import MoodHistory from './MoodHistory';
import FinanceTracker from './FinanceTracker';
import GroceryRecipe from './GroceryRecipe';
import HealthFitness from './HealthFitness';
import NotesSchedule from './NotesSchedule';
import BookQuotes from './BookQuotes';
import NotificationReminder from './NotificationReminder';
import Chatbot from './Chatbot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/moodform" element={<MoodForm />} />
        <Route path="/mood-tracker" element={<MoodHistory />} />
        <Route path="/finance-tracker" element={<FinanceTracker/>}/>
        <Route path="/health-fitness" element={<HealthFitness />} />
        <Route path="/book-quotes" element={<BookQuotes />} />
        <Route path="/notes-schedule" element={<NotesSchedule />} />
        <Route path="/recipe-grocery" element={<GroceryRecipe/>}/>
        <Route path="/notification-reminder" element={<NotificationReminder />} />
        <Route path="/chatbot" element={<Chatbot/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
