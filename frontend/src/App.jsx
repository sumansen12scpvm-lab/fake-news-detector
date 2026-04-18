import { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [newsText, setNewsText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!newsText) return alert("Please paste some news!");
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('https://fake-news-backend-qcf7.onrender.com/analyze', { text: newsText });
      setResult(response.data.result);
    } catch (error) {
      // This will show you the ACTUAL error from Render
      const errorMsg = error.response?.data?.error || error.message;
      setResult("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Fake News Detector</h1>
      <textarea 
        style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px' }}
        placeholder="Paste news content here..."
        value={newsText}
        onChange={(e) => setNewsText(e.target.value)}
      />
      <br />
      <button 
        onClick={handleAnalyze} 
        disabled={loading}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {loading ? "Analyzing..." : "Check News"}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default App;