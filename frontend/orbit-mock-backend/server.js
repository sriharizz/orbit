const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// The exact endpoint Builder 2's Axios code is calling
app.post('/api/submit', (req, res) => {
  const { submission_type, attempt_count, code, transcribed_text } = req.body;

  console.log(`\n📥 Received ${submission_type.toUpperCase()} submission! Attempt Count: ${attempt_count}`);

  // We add a 1.5-second delay to simulate the AI "thinking"
  setTimeout(() => {
    
    // --- 1. HANDLING CODE SUBMISSIONS ---
    if (submission_type === 'code') {
      
      // THE CHEAT CODE: If you type "pass" anywhere in the IDE, you succeed!
      // This lets you test the GSAP boat moving to Q2 and Viva.
      if (code && code.toLowerCase().includes('pass')) {
        console.log("✅ CHEAT ACTIVATED: Sending Mock Code Success");
        return res.json({
          is_correct: true,
          feedback_text: "Excellent! You optimized the solution perfectly."
        });
      }

      // NORMAL FLOW: We fail you. If attempt_count is 2 on the frontend, the boat will sink!
      console.log("❌ Sending Mock Failure + Mentor Diagram");
      return res.json({
        is_correct: false,
        feedback_text: "Your solution works, but it uses a nested loop which makes the time complexity O(n²). We need O(n). Take a look at the execution flow to see where the bottleneck is.",
        mermaid_diagram: `
          graph TD
            A[solve method] --> B{Nested Loop?}
            B -->|Yes| C[O N^2 Complexity]
            C --> D[Performance Alert]
            style C fill:#450a0a,stroke:#ef4444,stroke-width:2px
            style D fill:#172554,stroke:#3b82f6,stroke-width:2px
        `
      });
    } 
    
    // --- 2. HANDLING VOICE VIVA SUBMISSIONS ---
    else if (submission_type === 'viva') {
      // If the user spoke more than 10 characters, we pass them!
      if (transcribed_text && transcribed_text.length > 10) {
        console.log("✅ Sending Mock Viva Success");
        return res.json({
          viva_passed: true,
          feedback_text: "Flawless explanation. You correctly identified the O(N) time and O(1) space complexity."
        });
      } else {
        console.log("❌ Sending Mock Viva Failure");
        return res.json({
          viva_passed: false,
          feedback_text: "I couldn't quite hear enough detail. Please speak clearly and explain the Big O notation."
        });
      }
    }

  }, 1500); 
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Gamified Builder 3 Server running on http://localhost:${PORT}`);
  console.log(`Waiting for Project Orbit frontend submissions...`);
});