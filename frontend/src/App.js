import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Form from './Form'; // This imports your actual form component

function Home() {
  return <h1>Home Page</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App;