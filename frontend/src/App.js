import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Create two simple components
function Home() {
  return <h1>Home Page</h1>;
}

function FormPage() {
  return <h1>Form Page</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<FormPage />} />
      </Routes>
    </Router>
  );
}

export default App;