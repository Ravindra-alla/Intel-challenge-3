import { useState } from 'react';

const AITutor = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error:', error);
      setAnswer('Error getting response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">AI Tutor</h2>
      
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="w-full p-2 border rounded mb-2"
        rows={3}
      />
      
      <button 
        onClick={askAI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>

      {answer && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
};

export default AITutor;
