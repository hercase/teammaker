import { matchStore } from "@/store";

const DatePicker = () => {
  const { date, setDate } = matchStore();

  return (
    <div className="w-full text-sm text-gray-400">
      <span className="label">Fecha</span>
      <input type="datetime-local" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
    </div>
  );
};

export default DatePicker;
