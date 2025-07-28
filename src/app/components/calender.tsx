import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const getCurrentWeekDays = () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday as start

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateObj: date,
    };
  });
};

export default function CalendarWeekView({
  workoutDates = [],
}: {
  workoutDates: string[];
}) {
  const days = getCurrentWeekDays();

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isWorkoutDay = (date: Date) => {
    return workoutDates.some((d) => isSameDay(new Date(d), date));
  };

  return (
    <View className=" flex-1 bg-gray-50 py-3">
      <View className="text-center pb-4">
        <Text className=" text-gray-900 justify-center text-center text-xl font-semibold">
          CALENDAR
        </Text>
      </View>

      <View className="flex-row justify-around px-[10px]">
        {days.map(({ label, dateObj }) => {
          const hasWorkout = isWorkoutDay(dateObj);
          const highlightStyle = hasWorkout ? styles.selectedDay : null;
          const textStyle = hasWorkout ? styles.selectedText : null;

          return (
            <TouchableOpacity
              key={dateObj.toISOString()}
              className=" items-center w-[44px] "
            >
              <View style={[styles.day, highlightStyle]}>
                <Text style={[styles.dayLabel, textStyle]}>{label}</Text>
                <Text style={[styles.dayDate, textStyle]}>
                  {dateObj.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 22,
    gap: 10,
  },
  selectedDay: {
    backgroundColor: "#1f2937",
    borderRadius: 30,
    height: 60,
    width: 43,
  },
  dayLabel: {
    color: "#141414",
    fontWeight: "600",
    textAlign: "center",
  },
  dayDate: {
    color: "#141414",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  selectedText: {
    color: "#fffdfd",
  },
});
