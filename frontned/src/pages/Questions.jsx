// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./Questions.css"; // Import your styles

// const Questions = () => {
//   const { courseName, topicId } = useParams();
//   const navigate = useNavigate();

//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [answers, setAnswers] = useState({});

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/courses/questions/${courseName}/${topicId}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch questions");

//         const data = await response.json();
//         setQuestions(data);
//       } catch (error) {
//         console.error("Error fetching questions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [courseName, topicId]);

//   const handleOptionChange = (questionId, selectedOption) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: selectedOption,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (Object.keys(answers).length !== questions.length) {
//       alert("Please answer all questions before submitting.");
//       return;
//     }

//     let score = 0;
//     questions.forEach((q, index) => {
//       if (answers[index] === q.answer) {
//         score++;
//       }
//     });

//     navigate("/result", {
//       state: {
//         score,
//         total: questions.length,
//         questions,
//         answers,
//       },
//     });
//   };

//   if (loading)
//     return (
//       <h2 style={{ color: "white", textAlign: "center" }}>Loading...</h2>
//     );

//   return (
//     <div className="questions-container">
//       <div className="questions-box">
//         <h1 className="questions-title">Quiz: {courseName}</h1>

//         <form onSubmit={handleSubmit}>
//           {questions.map((q, index) => (
//             <div key={index} className="question-block">
//               <p className="question-text">
//                 {index + 1}. {q.question}
//               </p>

//               {q.options.map((opt, idx) => (
//                 <label key={idx} className="option-label">
//                   <input
//                     type="radio"
//                     name={`question-${index}`}
//                     value={opt}
//                     checked={answers[index] === opt}
//                     onChange={() => handleOptionChange(index, opt)}
//                     className="option-radio"
//                   />
//                   <span
//                     className={`custom-circle ${
//                       answers[index] === opt ? "selected" : ""
//                     }`}
//                   ></span>
//                   {opt}
//                 </label>
//               ))}
//             </div>
//           ))}

//           <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <button type="submit" className="submit-button">
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Questions;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Questions.css";

const Questions = () => {
  const { courseName, topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  const [timeLeft, setTimeLeft] = useState(100); // ⏰ TIMER: 3 mins

  // ⏰ TIMER: Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Time's up! Practise Well.");
      navigate(`/courses/${courseName}`);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, navigate, courseName]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/courses/questions/${courseName}/${topicId}`
        );
        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseName, topicId]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let score = 0;
    const submittedAnswers = [];

    questions.forEach((q, index) => {
      const selectedAnswer = answers[index] || "";
      const isCorrect = selectedAnswer === q.answer;
      if (isCorrect) score++;

      submittedAnswers.push({
        questionId: q._id,
        question: q.question,
        selectedAnswer,
        correctAnswer: q.answer,
        isCorrect,
      });
    });

    try {
      const response = await fetch("http://localhost:5000/api/result/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.name,
          courseName,
          topicId,
          score,
          totalQuestions: questions.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to save quiz results");

      navigate("/result", {
        state: {
          score,
          total: questions.length,
          questions,
          answers,
        },
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      alert("Failed to save results.");
    }
  };

  if (loading)
    return <h2 style={{ color: "white", textAlign: "center" }}>Loading...</h2>;

  return (
    <div className="questions-container">
      <div className="questions-box">
        <div className="questions-header">
          <h1 className="questions-title">Quiz: {courseName} </h1>
          <div className="timer" style={{ color: "red", fontWeight: "bold", fontSize: "18px", position: "absolute", right: "30px", top: "20px" }}>
          🕒 Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <div key={index} className="question-block">
              <p className="question-text">
                {index + 1}. {q.question}
              </p>

              {q.options.map((opt, idx) => (
                <label key={idx} className="option-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={opt}
                    checked={answers[index] === opt}
                    onChange={() => handleOptionChange(index, opt)}
                    className="option-radio"
                  />
                  <span
                    className={`custom-circle ${
                      answers[index] === opt ? "selected" : ""
                    }`}
                  ></span>
                  {opt}
                </label>
              ))}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Questions;
