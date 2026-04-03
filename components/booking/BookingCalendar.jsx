"use client";
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";

export default function BookingCalendar({ onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability,  setAvailability]  = useState({});
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const end   = format(endOfMonth(addMonths(currentMonth, 1)), "yyyy-MM-dd");
        const res   = await fetch(`/api/availability?start=${start}&end=${end}`);
        const data  = await res.json();
        const map   = {};
        data.forEach(d => { map[d.date] = d.status; });
        setAvailability(map);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchAvailability();
  }, [currentMonth]);

  const days       = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDay   = startOfMonth(currentMonth).getDay();
  const today      = startOfDay(new Date());
  const DAY_NAMES  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const getStatus = date => {
    const key = format(date, "yyyy-MM-dd");
    if (isBefore(date, today)) return "past";
    return availability[key] || "available";
  };

  const getDayStyle = (date) => {
    const status = getStatus(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentMonth);

    if (!isCurrentMonth) return { bg: "transparent", text: "#333", cursor: "default", border: "transparent" };
    if (isSelected) return { bg: "#C84B31", text: "white", cursor: "pointer", border: "#C84B31" };
    if (status === "past") return { bg: "transparent", text: "#444", cursor: "not-allowed", border: "transparent" };
    if (status === "booked") return { bg: "#2a0a0a", text: "#E53E3E", cursor: "not-allowed", border: "#E53E3E" };
    if (status === "blocked") return { bg: "#1a1a00", text: "#888", cursor: "not-allowed", border: "#555" };
    if (isToday(date)) return { bg: "#1a0a00", text: "#C84B31", cursor: "pointer", border: "#C84B31" };
    return { bg: "#1a1a1a", text: "white", cursor: "pointer", border: "#333" };
  };

  const handleDayClick = date => {
    const status = getStatus(date);
    if (status === "past" || status === "booked" || status === "blocked") return;
    if (!isSameMonth(date, currentMonth)) return;
    onDateSelect?.(date);
  };

  return (
    <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-600 text-gray-300 hover:border-gray-400 transition text-lg">‹</button>
        <h3 className="font-black text-white text-lg" style={{ fontFamily: "Georgia,serif" }}>{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-600 text-gray-300 hover:border-gray-400 transition text-lg">›</button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-bold py-2" style={{ color: "#666" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "#222" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(date => {
            const s = getDayStyle(date);
            return (
              <div key={date.toISOString()} onClick={() => handleDayClick(date)}
                className="h-10 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all"
                style={{ background: s.bg, color: s.text, cursor: s.cursor, borderColor: s.border }}>
                {format(date, "d")}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[["#C84B31","Selected / Available"],["#E53E3E","Booked"],["#555","Blocked"],["#444","Past"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: "#888" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="mt-4 p-3 rounded-xl text-center text-sm font-bold" style={{ background: "#1a0a00", color: "#C84B31", border: "1px solid #C84B31" }}>
          📅 Selected: {format(selectedDate, "EEEE, MMMM do yyyy")}
        </div>
      )}
    </div>
  );
}