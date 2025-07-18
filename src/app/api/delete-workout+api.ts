import { client } from "@/lib/client/client";

export async function POST(request: Request) {
  const { workoutId }: { workoutId: string } = await request.json();

  try {
    await client.delete(workoutId as string);

    console.log("Workout deleted successfully", workoutId);
    return Response.json({
      success: true,
      message: "workout deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workout from sever", error);
    return Response.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
