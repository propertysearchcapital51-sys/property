/* Splits text into masked words so CSS can slide each word up (hero headline intro). */
export default function SplitText({ text, start = 0 }) {
  const words = String(text).split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="split-word">
            <span className="split-word-inner" style={{ "--i": start + i }}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
