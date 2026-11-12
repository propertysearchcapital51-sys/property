import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ({ items }) {
  const [active, setActive] = useState(0);
  return <div className="faq-list">{items.map((item, index) => (
    <div className={`faq-item ${active === index ? "active" : ""}`} key={item.q}>
      <button onClick={() => setActive(active === index ? -1 : index)} aria-expanded={active === index}>
        <span>{item.q}</span>{active === index ? <Minus size={19}/> : <Plus size={19}/>}
      </button>
      {active === index && <div className="faq-answer"><p>{item.a}</p></div>}
    </div>
  ))}</div>;
}
