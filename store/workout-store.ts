import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WorkoutSet {
  id: string;
  reps: string;
  weight: string;
  weightUnit: "kg" | "lbs";
  isCompleted: boolean;
}

interface workoutExercises {
  id: string;
  sanityId: string;
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutStore {
  //these are the state Varibles
  workoutExercises: workoutExercises[];
  weightUnit: "kg" | "lbs";

  //These are the actions that will be performed on the state

  addExerciseWorkout: (exercise: { name: string; sanityId: string }) => void;

  setWorkoutExercise: (
    exercise:
      | workoutExercises[]
      | ((prev: workoutExercises[]) => workoutExercises[])
  ) => void;

  setWeightUnit: (unit: "kg" | "lbs") => void;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workoutExercises: [],
      weightUnit: "lbs",

      addExerciseWorkout: (exercise) =>
        set((state) => {
          const newExercise: workoutExercises = {
            id: Math.random().toString(),
            sanityId: exercise.sanityId,
            name: exercise.name,
            sets: [],
          };
          return {
            workoutExercises: [...state.workoutExercises, newExercise],
          };
        }),

      setWorkoutExercise: (execises) =>
        set((state) => ({
          workoutExercises:
            typeof execises === "function"
              ? execises(state.workoutExercises)
              : execises,
        })),

      setWeightUnit: (unit) =>
        set({
          weightUnit: unit,
        }),

      resetWorkout: () =>
        set({
          workoutExercises: [],
        }),
    }),
    {
      name: "workout-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        weightUnit: state.weightUnit,
      }),
    }
  )
);
