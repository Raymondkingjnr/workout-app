import OpenAi from "openai";

const openai = new OpenAi({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { exerciesName } = await request.json();

  if (!exerciesName) {
    return Response.json(
      { error: "Exercise name is required" },
      { status: 404 }
    );
  }

  const prompt = `
     You are a fitness coach.
     you are given an exercise, provide instruction on how to perform the exercise. Include if any equipment is required.
     explain the exercise in detail and for a beginner,

     the exercies name is ${exerciesName}

     keep it short and concise, use markdown formatting.

     use the following formart:

      ###Equipment Required

      ###Instruction

      ### Tips

      ### variation

      ### safety

     keep spacing between the heading and content
     
     Always use headings and subheadings  
    `;

  try {
    const res = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [{ role: "user", content: prompt }],
    });

    console.log(res);

    return Response.json({ message: res.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching AI guidance", error);
    return Response.json(
      { error: "Error fetching AI guidance" },
      { status: 500 }
    );
  }
}
